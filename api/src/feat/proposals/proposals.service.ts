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
import { EventPayload, PubsubService } from '~/core/pubsub/pubsub.service';
import { $ } from 'edgedb';
import { $uuid } from '~/edgeql-js/modules/std';
import { rejectProposal } from './reject-proposal.query';
import { approveProposal } from './approve-proposal.query';
import { UserInputError } from '@nestjs/apollo';
import { deleteResponse } from './delete-response.query';
import { approversToNotify } from './approvers-to-notify.query';
import { ExpoService } from '~/core/expo/expo.service';

export type UniqueProposal = UUID;

export const selectProposal = (id: UniqueProposal) =>
  e.select(e.Proposal, () => ({ filter_single: { id: e.uuid(id) } }));

export const selectProposal2 = (id: Set<$uuid, $.Cardinality.One>) =>
  e.select(e.Proposal, () => ({ filter_single: { id } }));

export interface ProposalUpdatedPayload extends EventPayload<ProposalEvent> {
  id: UUID;
  account: UAddress;
}
export const proposalTrigger = (account: UAddress) => `account.proposal:${account}`;

@Injectable()
export class ProposalsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private pubsub: PubsubService,
    private expo: ExpoService,
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
            order_by: { expression: p.createdAt, direction: e.DESC },
          };
        }),
      { account },
    );
  }

  async approve({ id: proposal, approver = getUserCtx().approver, signature }: ApproveInput) {
    const p = await this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Proposal, () => ({
          filter_single: { id },
          hash: true,
          account: { address: true },
        })),
      { id: proposal },
    );
    if (!p) throw new UserInputError('Proposal not found');

    const hash = asHex(p.hash);
    const network = this.networks.get(asUAddress(p.account.address));
    if (!(await asApproval({ hash, approver, signature, network })))
      throw new UserInputError('Invalid signature');

    await this.db.exec(deleteResponse, { proposal, approver });
    const approval = await this.db.exec(approveProposal, {
      proposal,
      approver,
      signature,
    });

    this.event(approval.proposal, ProposalEvent.approval);
    this.notifyApprovers(proposal);
  }

  async reject(proposal: UUID) {
    const approver = getUserCtx().approver;

    await this.db.exec(deleteResponse, { proposal, approver });
    const rejection = await this.db.exec(rejectProposal, { proposal, approver });

    this.event(rejection.proposal, ProposalEvent.rejection);
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

    this.event(p, ProposalEvent.update);
  }

  async event(
    proposal:
      | { id: UUID; account: UAddress }
      | { id: string; account: { address: string } }
      | undefined
      | null,
    event: ProposalEvent,
  ) {
    if (!proposal) return;

    const { id, account } =
      typeof proposal.account === 'object'
        ? { id: asUUID(proposal.id), account: asUAddress(proposal.account.address) }
        : (proposal as { id: UUID; account: UAddress });

    await this.pubsub.event<ProposalUpdatedPayload>(proposalTrigger(account), {
      id,
      account,
      event,
    });
  }

  async notifyApprovers(proposal: UUID) {
    // Get proposal policy approvers if proposer has approved or can't else {}
    const p = await this.db.exec(approversToNotify, { proposal });
    if (!p) return;

    await this.expo.sendNotification(
      p.approvers
        .filter((a) => a.pushToken)
        .map((a) => ({
          to: a.pushToken!,
          title: `Approval required for ${p.isTransaction ? `transaction` : `message`}`,
          channelId: 'activity',
          priority: 'normal',
          data: {
            href: {
              pathname: `/(nav)/[account]/(home)/activity/transaction/[id]`,
              params: { account: p.account, id: proposal },
            },
          },
        })),
    );
  }
}
