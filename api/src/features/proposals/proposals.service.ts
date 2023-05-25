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
} from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { TransactionsService } from '../transactions/transactions.service';
import {
  ApproveInput,
  ProposalEvent,
  ProposalsInput,
  ProposeInput,
  UpdateProposalInput,
} from './proposals.input';
import { getUser } from '~/request/ctx';
import { ExpoService } from '../util/expo/expo.service';
import { SatisfiablePolicy } from './proposals.model';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { BigNumberish } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { selectUser } from '../users/users.service';
import { selectPolicy } from '../policies/policies.util';

const ERC20 = Erc20__factory.createInterface();
const ERC20_TRANSFER = ERC20.functions['transfer(address,uint256)'];
const ERC20_TRANSFER_SELECTOR = asSelector(ERC20.getSighash(ERC20_TRANSFER));

export const getProposalTrigger = (hash: Hex) => `proposal.${hash}`;
export const getProposalAccountTrigger = (account: Address) => `proposal.account.${account}`;
export interface ProposalSubscriptionPayload {
  hash: Hex;
  account: Address;
  event: ProposalEvent;
}

export type UniqueProposal = uuid | Hex;

export const selectProposal = (id: UniqueProposal, shape?: ShapeFunc<typeof e.Proposal>) =>
  e.select(e.Proposal, (p) => ({
    ...shape?.(p),
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

export const selectTransactionProposal = (
  id: UniqueProposal,
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
    { accounts, statuses }: ProposalsInput = {},
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

  async propose({ account, to, value, data, nonce, gasLimit, feeToken, signature }: ProposeInput) {
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

  async approve({ hash, signature }: ApproveInput) {
    const approver = getUser();
    if (!(await this.provider.verifySignature({ digest: hash, approver, signature })))
      throw new UserInputError('Invalid signature');

    await this.db.transaction(async (client) => {
      const proposal = selectProposal(hash);
      const user = selectUser(approver);

      // Remove prior response (if any)
      await e.delete(e.ProposalResponse, () => ({ filter_single: { proposal, user } })).run(client);

      await e
        .insert(e.Approval, {
          proposal,
          user,
          signature,
        })
        .run(client);
    });

    await this.publishProposal(hash, ProposalEvent.approval);

    await this.transactions.tryExecute(hash);
  }

  async reject(id: UniqueProposal) {
    await this.db.transaction(async (client) => {
      const proposal = selectProposal(id);
      const user = selectUser(getUser());

      // Remove prior response (if any)
      await e.delete(e.ProposalResponse, () => ({ filter_single: { proposal, user } })).run(client);

      await e.insert(e.Rejection, { proposal, user }).run(client);
    });

    await this.publishProposal(id, ProposalEvent.rejection);
  }

  async update({ hash, policy }: UpdateProposalInput) {
    if (policy !== undefined) {
      await this.db.query(
        e.update(e.Proposal, (p) => ({
          filter_single: { hash },
          set: {
            policy: policy
              ? e.select(e.Policy, () => ({ filter_single: { account: p.account, key: policy } }))
              : null,
          },
        })),
      );
    }
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

      return e.delete(selectProposal(id)).id.run(client);
    });
  }

  private async getUnusedNonce(account: Address) {
    const maxNonce = (await this.db.query(
      e.max(
        e.select(e.TransactionProposal, (p) => ({
          filter: e.op(p.account, '=', selectAccount(account)),
          nonce: true,
        })).nonce,
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

  async publishProposal(
    proposal: Pick<ProposalSubscriptionPayload, 'hash' | 'account'> | UniqueProposal,
    event: ProposalSubscriptionPayload['event'],
  ) {
    const { hash, account } =
      typeof proposal === 'string'
        ? await (async () => {
            const p = await this.db.query(
              e.assert_exists(
                e.select(e.Proposal, () => ({
                  filter_single: isHex(proposal) ? { hash: proposal } : { id: proposal },
                  hash: true,
                  account: { address: true },
                })),
              ),
            );

            return { hash: p.hash as Hex, account: p.account.address as Address };
          })()
        : proposal;

    const payload: ProposalSubscriptionPayload = { hash, account, event };

    await Promise.all([
      this.pubsub.publish<ProposalSubscriptionPayload>(getProposalTrigger(hash), payload),
      this.pubsub.publish<ProposalSubscriptionPayload>(getProposalAccountTrigger(account), payload),
    ]);
  }

  async satisfiablePoliciesResponse(id: UniqueProposal) {
    const { policies, approvals } = await this.transactions.satisfiablePolicies(id);

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
