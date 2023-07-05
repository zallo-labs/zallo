import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserInputError } from '@nestjs/apollo';
import { hashTx, Address, estimateOpGas, Hex, isHex, asTx } from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { TransactionsService } from '../transactions/transactions.service';
import {
  ApproveInput,
  OperationInput,
  ProposalEvent,
  ProposalsInput,
  ProposeInput,
  UpdateProposalInput,
} from './proposals.input';
import { getApprover, getUserCtx } from '~/request/ctx';
import { ExpoService } from '../util/expo/expo.service';
import { SatisfiablePolicy } from './proposals.model';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { PaymasterService } from '../paymaster/paymaster.service';
import { SimulationService } from '../simulation/simulation.service';
import { selectApprover } from '../approvers/approvers.service';

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
    private paymaster: PaymasterService,
    private simulation: SimulationService,
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

  async propose({
    account,
    operations,
    label,
    nonce,
    gasLimit,
    feeToken = ETH_ADDRESS as Address,
    signature,
  }: ProposeInput) {
    return await this.db.transaction(async (client) => {
      if (!operations.length) throw new UserInputError('No operations provided');

      const tx = asTx({
        operations: operations as [OperationInput, ...OperationInput[]],
        nonce: nonce ?? (await this.getUnusedNonce(account)),
      });
      const hash = await hashTx(tx, { address: account, provider: this.provider });

      if (!(await this.paymaster.isSupportedFeeToken(feeToken)))
        throw new UserInputError(`Fee token not supported: ${feeToken}`);

      const { id } = await e
        .insert(e.TransactionProposal, {
          hash,
          account: selectAccount(account),
          label,
          operations: e.set(
            ...operations.map((op) =>
              e.insert(e.Operation, {
                to: op.to,
                value: op.value,
                data: op.data,
              }),
            ),
          ),
          // operations: e.for(e.set(...operations.map((op) => e.json(op))), (item) =>
          //   e.insert(e.Operation, {
          //     to: e.cast(e.str, item.to),
          //     value: e.cast(e.bigint, item.value), // bigint needs to be converted to a string (in e.json(op)) first
          //     data: e.cast(e.str, item.data),
          //   }),
          // ),
          nonce: tx.nonce,
          gasLimit: gasLimit || (await estimateOpGas(this.provider, tx)),
          feeToken,
          simulation: await this.simulation.getInsert(account, tx),
        })
        .run(client);

      await this.publishProposal({ account, hash }, ProposalEvent.create);

      if (signature) await this.approve({ hash, signature });

      return { id, hash };
    });
  }

  async approve({ hash, signature }: ApproveInput) {
    const ctx = getUserCtx();

    if (!(await this.provider.verifySignature({ digest: hash, approver: ctx.approver, signature })))
      throw new UserInputError('Invalid signature');

    await this.db.transaction(async (client) => {
      const proposal = selectProposal(hash);
      const approver = selectApprover(ctx.approver);

      // Remove prior response (if any)
      await e
        .delete(e.ProposalResponse, () => ({ filter_single: { proposal, approver } }))
        .run(client);

      await e
        .insert(e.Approval, {
          proposal,
          approver,
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
      const approver = selectApprover(getUserCtx().approver);

      // Remove prior response (if any)
      await e
        .delete(e.ProposalResponse, () => ({ filter_single: { proposal, approver } }))
        .run(client);

      await e.insert(e.Rejection, { proposal, approver }).run(client);
    });

    await this.publishProposal(id, ProposalEvent.rejection);
  }

  async update({ hash, policy, feeToken }: UpdateProposalInput) {
    if (feeToken !== undefined && !(await this.paymaster.isSupportedFeeToken(feeToken)))
      throw new UserInputError(`Fee token not supported: ${feeToken}`);

    const updatedProposal = e.assert_single(
      e.update(e.TransactionProposal, (p) => ({
        filter: and(
          e.op(p.hash, '=', hash),
          // Require proposal to be pending or failed
          e.op(
            p.status,
            'in',
            e.set(e.TransactionProposalStatus.Pending, e.TransactionProposalStatus.Failed),
          ),
        ),
        set: {
          ...(policy !== undefined && {
            policy: policy
              ? e.select(e.Policy, () => ({ filter_single: { account: p.account, key: policy } }))
              : null,
          }),
          ...(feeToken !== undefined && { feeToken }), // TODO: validate paymaster supports fee tokens
        },
      })),
    );

    const p = await this.db.query(
      e.select(updatedProposal, () => ({
        hash: true,
        account: {
          address: true,
        },
      })),
    );

    if (p) {
      this.publishProposal(
        { hash: p.hash as Hex, account: p.account.address as Address },
        ProposalEvent.update,
      );
    }

    return p;
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
    )) as bigint | unknown; // https://github.com/edgedb/edgedb-js/issues/594

    return typeof maxNonce === 'bigint' ? maxNonce + 1n : 0n;
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
    const { policies, approvals, rejections } = await this.transactions.satisfiablePolicies(id);

    const user = getApprover();
    const userHasResponded = approvals.has(user) || rejections.has(user);

    return policies
      .filter(({ satisfiability }) => satisfiability.result !== 'unsatisfiable')
      .map(
        ({ policy, satisfiability }): SatisfiablePolicy => ({
          id: `${id}-${policy.key}`,
          key: policy.key,
          satisfied: satisfiability.result === 'satisfied',
          responseRequested:
            !userHasResponded &&
            satisfiability.result === 'satisfiable' &&
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
