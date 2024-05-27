import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import e from '~/edgeql-js';
import { UAddress, asApproval, asHex, asUAddress, UUID, asUUID } from 'lib';
import { getUserCtx } from '#/util/context';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import { NetworksService } from '~/features/util/networks/networks.service';
import {
  ApproveInput,
  ProposalEvent,
  ProposalsInput,
  UpdateProposalInput,
} from './proposals.input';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';

export type UniqueProposal = UUID;

export const selectProposal = (id: UniqueProposal) =>
  e.select(e.Proposal, () => ({ filter_single: { id: e.uuid(id) } }));

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
    return this.db.query(
      e.select(e.Proposal, (p) => ({
        filter_single: { id },
        ...shape?.(p),
      })),
    );
  }

  async select({ accounts, pending }: ProposalsInput, shape: ShapeFunc<typeof e.Proposal>) {
    return this.db.query(
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
          filter: and(
            accounts && e.op(p.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
            pendingFilter,
          ),
          order_by: p.createdAt,
        };
      }),
    );
  }

  async approve({ id, approver = getUserCtx().approver, signature }: ApproveInput) {
    const selectedProposal = selectProposal(id);
    const p = await this.db.query(
      e.select(selectedProposal, () => ({
        hash: true,
        account: { address: true },
      })),
    );
    if (!p) throw new UserInputError('Proposal not found');

    const hash = asHex(p.hash);
    const network = this.networks.get(asUAddress(p.account.address));
    if (!(await asApproval({ hash, approver, signature, network })))
      throw new UserInputError('Invalid signature');

    await this.db.transaction(async () => {
      const selectApprover = e.select(e.Approver, () => ({ filter_single: { address: approver } }));

      // Remove prior response (if any); this may be a prior approval that could now be invalid
      await this.db.query(
        e.delete(e.ProposalResponse, () => ({
          filter_single: {
            proposal: selectedProposal,
            approver: selectApprover,
          },
        })),
      );

      await this.db.query(
        e.insert(e.Approval, {
          proposal: selectedProposal,
          approver: selectApprover,
          signature,
          signedHash: hash,
        }),
      );
    });

    this.publish(id, ProposalEvent.approval);
  }

  async reject(id: UUID) {
    await this.db.transaction(async () => {
      const proposal = selectProposal(id);

      // Remove prior approval (if any)
      await this.db.query(
        e.delete(e.Approval, () => ({
          filter_single: { proposal, approver: e.global.current_approver },
        })),
      );

      await this.db.query(e.insert(e.Rejection, { proposal }));
    });

    this.publish(id, ProposalEvent.rejection);
  }

  async update({ id, policy }: UpdateProposalInput) {
    if (policy === undefined) return;

    const p = await this.db.query(
      e.select(
        e.update(e.Proposal, (p) => ({
          filter_single: { id },
          set: {
            ...(policy !== undefined && { policy: e.latestPolicy(p.account, policy) }),
          },
        })),
        () => ({
          id: true,
          account: { address: true },
        }),
      ),
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
            const p = await this.db.query(
              e.assert_exists(
                e.select(e.Proposal, () => ({
                  filter_single: { id: proposal },
                  id: true,
                  account: { address: true },
                })),
              ),
            );

            return { id: asUUID(p.id), account: asUAddress(p.account.address) };
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
