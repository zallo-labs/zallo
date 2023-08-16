import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { Address, Hex, isHex } from 'lib';
import { getUserCtx } from '~/request/ctx';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { ApproveInput, ProposalEvent, ProposalsInput } from './proposals.input';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { and, or } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';

export type UniqueProposal = uuid | Hex;

export const selectProposal = (id: UniqueProposal, shape?: ShapeFunc<typeof e.Proposal>) =>
  e.select(e.Proposal, (p) => ({
    ...shape?.(p),
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

export interface ProposalSubscriptionPayload {
  hash: Hex;
  account: Address;
  event: ProposalEvent;
}
export const getProposalTrigger = (hash: Hex) => `proposal.${hash}`;
export const getProposalAccountTrigger = (account: Address) => `proposal.account.${account}`;

@Injectable()
export class ProposalsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    private pubsub: PubsubService,
  ) {}

  async selectUnique(id: UniqueProposal, shape: ShapeFunc<typeof e.Proposal>) {
    return this.db.query(selectProposal(id, shape));
  }

  async select({ accounts, pending }: ProposalsInput, shape: ShapeFunc<typeof e.Proposal>) {
    const r = await this.db.query(
      e.select(e.Proposal, (p) => ({
        ...shape?.(p),
        __type__: { name: true },
        order_by: p.createdAt,
        filter: and(
          accounts && e.op(p.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          // pending !== undefined &&
          //   or(
          //     e.op(
          //       p.is(e.TransactionProposal).status,
          //       pending ? '?=' : ('?!=' as '?='),
          //       e.TransactionProposalStatus.Pending,
          //     ),
          //   ),
        ),
      })),
    );

    return r;
  }

  async approve({ hash, approver = getUserCtx().approver, signature }: ApproveInput) {
    if (!(await this.provider.verifySignature({ digest: hash, approver, signature })))
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
}
