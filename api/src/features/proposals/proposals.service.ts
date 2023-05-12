import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserInputError } from 'apollo-server-core';
import {
  hashTx,
  Address,
  asAddress,
  Tx,
  PolicySatisfiability,
  estimateOpGas,
  Hex,
  asBigInt,
  Erc20__factory,
  asSelector,
  Addresslike,
  isHex,
  getTransactionSatisfiability,
  Policy,
} from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { TransactionsService } from '../transactions/transactions.service';
import {
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
  ApproveArgs,
  ProposalEvent,
  ProposalsArgs,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  ProposeArgs,
} from './proposals.args';
import { getUser } from '~/request/ctx';
import { ExpoService } from '../util/expo/expo.service';
import { policyStateAsPolicy, policyStateShape } from '../policies/policies.service';
import { SatisfiablePolicy } from './proposals.model';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { BigNumberish } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.service';
import { selectUser } from '../users/users.service';

const ERC20 = Erc20__factory.createInterface();
const ERC20_TRANSFER = ERC20.functions['transfer(address,uint256)'];
const ERC20_TRANSFER_SELECTOR = asSelector(ERC20.getSighash(ERC20_TRANSFER));

export type UniqueProposal = uuid | Hex;

export const selectProposal = (id: uuid | Hex, shape?: ShapeFunc<typeof e.Proposal>) =>
  e.select(e.Proposal, (p) => ({
    ...shape?.(p),
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

export const selectTransactionProposal = (
  id: uuid | Hex,
  shape?: ShapeFunc<typeof e.TransactionProposal>,
) =>
  e.select(e.TransactionProposal, (p) => ({
    ...shape?.(p),
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

@Injectable()
export class ProposalsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    private expo: ExpoService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.TransactionProposal>) {
    return this.db.query(selectTransactionProposal(id, shape));
  }

  async select(
    { accounts, statuses }: ProposalsArgs = {},
    shape?: ShapeFunc<typeof e.TransactionProposal>,
  ) {
    return this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        ...shape?.(p),
        filter: and(
          accounts && e.op(p.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          statuses &&
            e.op(
              p.status,
              'in',
              e.set(...statuses.map((s) => e.cast(e.TransactionProposalStatus, s))),
            ),
        ),
      })),
    );
  }

  async propose({ account, to, value, data, nonce, gasLimit, feeToken, signature }: ProposeArgs) {
    return await this.db.transaction(async (client) => {
      const tx: Tx = {
        to,
        value,
        data,
        nonce: nonce ?? (await this.getUnusedNonce(account)),
      };
      const hash = await hashTx(tx, { address: account, provider: this.provider });

      const { id } = await e
        .insert(e.TransactionProposal, {
          hash,
          account: selectAccount(account),
          to,
          value,
          data,
          nonce: tx.nonce,
          gasLimit: gasLimit || (await estimateOpGas(this.provider, tx)),
          feeToken: feeToken ?? asAddress(ETH_ADDRESS),
          simulation: this.insertSimulation(account, tx),
        })
        .run(client);

      if (signature) await this.approve({ hash, signature });

      return { id, hash };
    });
  }

  async approve({ hash, signature }: ApproveArgs) {
    const approver = getUser();
    if (!(await this.provider.verifySignature({ digest: hash, approver, signature })))
      throw new UserInputError('Invalid signature');

    await this.db.transaction(async (client) => {
      const proposal = selectProposal(hash);
      const user = selectUser(approver);

      // Remove prior rejection (if any)
      await e.delete(e.Rejection, () => ({ filter_single: { proposal, user } })).run(client);

      await e
        .insert(e.Approval, {
          proposal,
          user,
          signature,
        })
        .run(client);
    });

    const proposal = await this.db.query(
      e.assert_exists(
        selectProposal(hash, () => ({
          id: true,
          account: () => ({ id: true }),
        })),
      ),
    );
    await this.publishProposal({ proposal: proposal as any, event: ProposalEvent.approval });

    await this.transactions.tryExecute(hash);

    return proposal;
  }

  async reject(id: UniqueProposal) {
    await this.db.transaction(async (client) => {
      const proposal = selectProposal(id);
      const user = selectUser(getUser());

      // Delete prior approval (if any)
      await e.delete(e.Approval, () => ({ filter_single: { proposal, user } })).run(client);

      await e.insert(e.Rejection, { proposal, user }).run(client);
    });

    const proposal = await this.db.query(
      e.assert_exists(
        selectProposal(id, () => ({
          id: true,
          account: () => ({ id: true }),
        })),
      ),
    );
    await this.publishProposal({ proposal: proposal as any, event: ProposalEvent.rejection });
  }

  async delete(id: UniqueProposal) {
    return this.db.transaction(async (client) => {
      // 1. Policies the proposal was going to create
      // Delete policies the proposal was going to activate
      const proposalPolicies = e.select(e.TransactionProposal, (p) => ({
        filter_single: isHex(id) ? { hash: id } : { id },
        beingCreated: e.select(p['<proposal[is PolicyState]'], (ps) => ({
          filter: e.op(e.count(ps.policy.stateHistory), '=', 1),
          policy: () => ({ id: true }),
        })),
      }));

      // TODO: use policies service instead? Ensures nothing weird happens
      await e.for(e.set(proposalPolicies.beingCreated.policy), (p) => e.delete(p)).run(client);

      return !!(await e.delete(selectProposal(id)).run(client));
    });
  }

  private async getUnusedNonce(account: Address) {
    const maxNonce = (await this.db.query(
      e.max(
        selectAccount(account, () => ({ transactionProposals: () => ({ nonce: true }) }))
          .transactionProposals.nonce,
      ),
    )) as bigint | undefined; // https://github.com/edgedb/edgedb-js/issues/594

    return maxNonce ? maxNonce + 1n : 0n;
  }

  private insertSimulation(accountAddress: Address, { to, value, data }: Tx) {
    const account = selectAccount(accountAddress);

    const transfers: Parameters<typeof e.insert<typeof e.TransferDetails>>[1][] = [];
    if (value && value > 0n) {
      transfers.push({
        account,
        direction: 'Out',
        from: accountAddress,
        to,
        token: asAddress(ETH_ADDRESS),
        amount: -value,
      });
    }

    if (data && asSelector(data) === ERC20_TRANSFER_SELECTOR) {
      try {
        const [dest, amount] = ERC20.decodeFunctionData(ERC20_TRANSFER, data) as [
          Addresslike,
          BigNumberish,
        ];

        transfers.push({
          account,
          direction: 'Out',
          from: accountAddress,
          to: asAddress(dest),
          token: to,
          amount: -asBigInt(amount),
        });
      } catch (e) {
        Logger.warn(`Failed to decode ERC20 transfer data: ${e}`);
      }
    }

    return e.insert(e.Simulation, {
      ...(transfers.length && {
        transfers: e.set(...transfers.map((t) => e.insert(e.TransferDetails, t))),
      }),
    });
  }

  async publishProposal(payload: ProposalSubscriptionPayload) {
    await Promise.all([
      this.pubsub.publish<ProposalSubscriptionPayload>(
        `${PROPOSAL_SUBSCRIPTION}.${payload[PROPOSAL_SUBSCRIPTION].hash}`,
        payload,
      ),
      this.pubsub.publish<ProposalSubscriptionPayload>(
        `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${payload[PROPOSAL_SUBSCRIPTION].account.id}`,
        payload,
      ),
    ]);
  }

  async satisfiablePolicies(id: UniqueProposal) {
    const proposal = await this.db.query(
      selectTransactionProposal(id, () => ({
        to: true,
        value: true,
        data: true,
        nonce: true,
        gasLimit: true,
        approvals: {
          user: { address: true },
        },
        account: {
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
      })),
    );
    if (!proposal) throw new Error(`Proposal ${id} not found`);

    const tx: Tx = {
      to: proposal.to as Address,
      value: proposal.value ?? undefined,
      data: (proposal.data ?? undefined) as Hex | undefined,
      nonce: proposal.nonce,
    };

    const approvals = new Set(proposal.approvals.map((a) => a.address as Address));

    const policies = ((proposal.account as any).policies as any[]).map((policy) => {
      const p = policyStateAsPolicy(policy.key, policy.state);
      return { policy: p, satisfiability: getTransactionSatisfiability(p, tx, approvals) };
    });

    return { policies, approvals };
  }

  async firstSatisfiedPolicy(id: UniqueProposal): Promise<Policy | undefined> {
    return (await this.satisfiablePolicies(id)).policies.find(
      ({ satisfiability }) => satisfiability === PolicySatisfiability.Satisfied,
    )?.policy;
  }

  // Can be optimised to include required proposal fields as computed field dependencies
  async satisfiablePoliciesResponse(id: UniqueProposal) {
    const { policies, approvals } = await this.satisfiablePolicies(id);

    const user = getUser();
    const userHasApproved = approvals.has(user);

    return policies
      .filter(({ satisfiability }) => satisfiability !== PolicySatisfiability.Unsatisifable)
      .map(
        ({ policy, satisfiability }): SatisfiablePolicy => ({
          id: `${id}-${policy.key}`,
          key: policy.key,
          satisfied: satisfiability === PolicySatisfiability.Satisfied,
          requiresUserAction:
            satisfiability === PolicySatisfiability.Satisfiable &&
            !userHasApproved &&
            policy.approvers.has(user),
        }),
      );
  }

  // private async notifyApprovers(proposalId: string) {
  //   // TODO: implement
  //   const { approvals, quorum } = await this.prisma.asUser.proposal.findUniqueOrThrow({
  //     where: { id: proposalId },
  //     select: {
  //       approvals: { select: { userId: true } },
  //       quorum: {
  //         select: {
  //           key: true,
  //           activeState: {
  //             select: {
  //               approvers: {
  //                 select: {
  //                   user: {
  //                     select: {
  //                       id: true,
  //                       pushToken: true,
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   const alreadyApproved = new Set(approvals.map((a) => a.userId));
  //   const approverPushTokens = (quorum.activeState?.approvers ?? [])
  //     .filter((a) => !alreadyApproved.has(a.user.id) && a.user.pushToken)
  //     .map((a) => a.user.pushToken)
  //     .filter(isPresent);
  //   // Send a notification to specified users that haven't approved yet
  //   this.expo.chunkPushNotifications([
  //     {
  //       to: approverPushTokens,
  //       title: 'Approval Request',
  //       body: 'Your approval has been required on a proposal',
  //       data: { url: `zallo://proposal/?id=${proposalId}` },
  //     },
  //   ]);
  //   // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications
  // }
}
