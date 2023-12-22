import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import e from '~/edgeql-js';
import { Hex, UAddress, asApproval, asHex, asUAddress, isHex, UUID, asUUID } from 'lib';
import { getUserCtx } from '~/request/ctx';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import { NetworksService } from '~/features/util/networks/networks.service';
import {
  ApproveInput,
  LabelProposalRiskInput,
  ProposalEvent,
  ProposalsInput,
  UpdateProposalInput,
} from './proposals.input';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';

export type UniqueProposal = UUID | Hex;

export const selectProposal = (id: UniqueProposal, shape?: ShapeFunc<typeof e.Proposal>) =>
  e.select(e.Proposal, (p) => ({
    ...shape?.(p),
    filter_single: isHex(id) ? { hash: id } : { id: e.uuid(id) },
  }));

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

  async selectUnique(id: UniqueProposal, shape: ShapeFunc<typeof e.Proposal>) {
    return this.db.query(
      selectProposal(id, (p) => ({
        ...shape?.(p),
        __type__: { name: true },
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
              e.op(p.is(e.TransactionProposal).status, '=', e.TransactionProposalStatus.Pending),
              'if',
              e.op('exists', p.is(e.TransactionProposal)),
              'else',
              e.op('not', e.op('exists', p.is(e.MessageProposal).signature)),
            ),
          );

          return pending ? isPending : e.op('not', isPending);
        })();

        return {
          ...shape?.(p),
          __type__: { name: true },
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
    const p = await this.db.query(
      e.select(e.Proposal, () => ({
        filter_single: { id },
        hash: true,
        account: { address: true },
      })),
    );
    if (!p) throw new UserInputError('Proposal not found');

    const hash = asHex(p.hash);
    const network = this.networks.get(asUAddress(p.account.address));
    if (!(await asApproval({ hash: hash, approver, signature, network })))
      throw new UserInputError('Invalid signature');

    await this.db.transaction(async (db) => {
      const proposal = selectProposal(hash);
      const selectApprover = e.select(e.Approver, () => ({ filter_single: { address: approver } }));

      // Remove prior response (if any)
      await e
        .delete(e.ProposalResponse, () => ({
          filter_single: {
            proposal,
            approver: selectApprover,
          },
        }))
        .run(db);

      await e
        .insert(e.Approval, {
          proposal,
          approver: selectApprover,
          signature,
          signedHash: hash,
        })
        .run(db);
    });

    await this.publishProposal(hash, ProposalEvent.approval);
  }

  async reject(id: UniqueProposal) {
    await this.db.transaction(async (db) => {
      const proposal = selectProposal(id);

      // Remove prior response (if any)
      await e
        .delete(e.ProposalResponse, () => ({
          filter_single: { proposal, approver: e.global.current_approver },
        }))
        .run(db);

      await e.insert(e.Rejection, { proposal }).run(db);
    });

    await this.publishProposal(id, ProposalEvent.rejection);
  }

  async update({ id, policy }: UpdateProposalInput) {
    if (policy === undefined) return;

    const p = await this.db.query(
      e.select(
        e.update(e.Proposal, (p) => ({
          filter_single: { id },
          set: {
            policy:
              policy !== null
                ? e.select(e.Policy, () => ({ filter_single: { account: p.account, key: policy } }))
                : null,
          },
        })),
        () => ({
          account: { address: true },
        }),
      ),
    );

    if (p)
      this.publishProposal({ id, account: asUAddress(p.account.address) }, ProposalEvent.update);
  }

  async publishProposal(
    proposal: Pick<ProposalSubscriptionPayload, 'id' | 'account'> | UniqueProposal,
    event: ProposalSubscriptionPayload['event'],
  ) {
    const { id, account } =
      typeof proposal === 'string'
        ? await (async () => {
            const p = await this.db.query(
              e.assert_exists(
                e.select(e.Proposal, () => ({
                  filter_single: isHex(proposal) ? { hash: proposal } : { id: proposal },
                  id: true,
                  account: { address: true },
                })),
              ),
            );

            return { id: asUUID(p.id), account: asUAddress(p.account.address) };
          })()
        : proposal;

    const payload: ProposalSubscriptionPayload = { id, account, event };

    await Promise.all([
      this.pubsub.publish<ProposalSubscriptionPayload>(getProposalTrigger(id), payload),
      this.pubsub.publish<ProposalSubscriptionPayload>(getProposalAccountTrigger(account), payload),
    ]);
  }

  async labelProposalRisk({ id, risk }: LabelProposalRiskInput) {
    await this.db.query(
      e.insert(e.ProposalRiskLabel, { proposal: selectProposal(id), risk }).unlessConflict((l) => ({
        on: e.tuple([l.proposal, l.user]),
        else: e.update(l, () => ({ set: { risk } })),
      })),
    );
  }
}
