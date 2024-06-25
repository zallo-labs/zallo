import { Injectable } from '@nestjs/common';
import e, { Set } from '~/edgeql-js';
import { UAddress, asUAddress, UUID, asUUID, asApproval, asHex } from 'lib';
import { getUserCtx } from '~/core/context';
import { DatabaseService, ShapeFunc, and } from '~/core/database';
import { NetworksService } from '~/core/networks';
import {
  ApproveInput,
  ProposalEvent,
  ProposalsInput,
  UpdateProposalInput,
} from './proposals.input';
import { PubsubService } from '~/core/pubsub/pubsub.service';
import { $ } from 'edgedb';
import { $uuid } from '~/edgeql-js/modules/std';
import { rejectProposal } from './reject-proposal.query';
import { approveProposal } from './approve-proposal.query';
import { UserInputError } from '@nestjs/apollo';

export type UniqueProposal = UUID;

export const selectProposal = (id: UniqueProposal) =>
  e.select(e.Proposal, () => ({ filter_single: { id: e.uuid(id) } }));

export const selectProposal2 = (id: Set<$uuid, $.Cardinality.One>) =>
  e.select(e.Proposal, () => ({ filter_single: { id } }));

export interface ProposalSubscriptionPayload {
  id: UUID;
  account: UAddress;
  event: ProposalEvent;
}
export const getProposalTrigger = (id: UUID) => `proposal.${id}`;
export const getProposalAccountTrigger = (account: UAddress) => `proposal.account.${account}`;

@Injectable()
export class ProposalsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private pubsub: PubsubService,
  ) {}

  async selectUnique(id: UUID, shape: ShapeFunc<typeof e.Proposal>) {
    return this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Proposal, (p) => ({
          filter_single: { id },
          ...shape(p),
        })),
      { id },
    );
  }

  async select(account: UUID, { pending }: ProposalsInput, shape: ShapeFunc<typeof e.Proposal>) {
    return this.db.queryWith(
      { account: e.uuid },
      ({ account }) =>
        e.select(e.Proposal, (p) => {
          const pendingFilter = (() => {
            if (pending === undefined) return undefined;

            const isPending = e.select(
              e.op(
                e.op(p.is(e.Transaction).status, '=', e.TransactionStatus.Pending),
                'if',
                e.op('exists', p.is(e.Transaction)),
                'else',
                e.op('not', e.op('exists', p.is(e.Message).signature)),
              ),
            );

            return pending ? isPending : e.op('not', isPending);
          })();

          return {
            ...shape?.(p),
            ...(pendingFilter ? { pendingFilter } : {}), // Must be included in the select (not just the filter) to avoid bug
            filter: and(e.op(p.account, '=', e.cast(e.Account, account)), pendingFilter),
            order_by: p.createdAt,
          };
        }),
      { account },
    );
  }

  async approve({ id, approver = getUserCtx().approver, signature }: ApproveInput) {
    const p = await this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Proposal, () => ({
          filter_single: { id },
          hash: true,
          account: { address: true },
        })),
      { id },
    );
    if (!p) throw new UserInputError('Proposal not found');

    const hash = asHex(p.hash);
    const network = this.networks.get(asUAddress(p.account.address));
    if (!(await asApproval({ hash, approver, signature, network })))
      throw new UserInputError('Invalid signature');

    await this.db.exec(approveProposal, {
      proposal: id,
      approver,
      signature,
    });

    this.publish(id, ProposalEvent.approval);
  }

  async reject(id: UUID) {
    await this.db.exec(rejectProposal, { proposal: id });

    this.publish(id, ProposalEvent.rejection);
  }

  async update({ id, policy }: UpdateProposalInput) {
    if (policy === undefined) return;

    const p = await this.db.queryWith(
      { id: e.uuid, policy: e.optional(e.uint16) },
      ({ id, policy }) =>
        e.select(
          e.update(e.Proposal, (p) => ({
            filter_single: { id },
            set: {
              policy: e.latestPolicy(p.account, policy),
            },
          })),
          () => ({
            id: true,
            account: { address: true },
          }),
        ),
      { id, policy },
    );

    this.publish(p, ProposalEvent.update);
  }

  async publish(
    proposal:
      | { id: UUID; account: UAddress }
      | { id: string; account: { address: string } }
      | UUID
      | undefined
      | null,
    event: ProposalEvent,
  ) {
    if (!proposal) return;

    const { id, account } =
      typeof proposal === 'string'
        ? await (async () => {
            const account = await this.db.queryWith2({ id: e.uuid }, { id: proposal }, ({ id }) =>
              e.assert_exists(
                e.select(e.Proposal, () => ({ filter_single: { id } })).account.address,
              ),
            );

            return { id: proposal, account: asUAddress(account) };
          })()
        : typeof proposal.account === 'object'
          ? { id: asUUID(proposal.id), account: asUAddress(proposal.account.address) }
          : (proposal as { id: UUID; account: UAddress });

    const payload: ProposalSubscriptionPayload = { id, account, event };

    await Promise.all([
      this.pubsub.publish<ProposalSubscriptionPayload>(getProposalTrigger(id), payload),
      this.pubsub.publish<ProposalSubscriptionPayload>(getProposalAccountTrigger(account), payload),
    ]);
  }
}
