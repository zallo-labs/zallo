import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProposeMessageInput } from './message-proposals.input';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { hashMessage, hexToString } from 'viem';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { Address, Hex, asHex, encodeAccountSignature, isHex, isPresent, mapAsync } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { policyStateAsPolicy, policyStateShape } from '../policies/policies.util';
import { ProviderService } from '../util/provider/provider.service';

@Injectable()
export class MessageProposalsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    private proposals: ProposalsService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.MessageProposal>) {
    return this.db.query(
      e.select(e.MessageProposal, (p) => ({
        ...shape?.(p),
        filter_single: isHex(id) ? { hash: id } : { id },
      })),
    );
  }

  async propose({ account, message, label, iconUri, signature }: ProposeMessageInput) {
    if (isHex(message)) message = hexToString(message);

    const hash = asHex(hashMessage(message));

    // upsert can't be used as exclusive hash constraint exists on parent type (Proposal)
    const proposal =
      (await this.db.query(e.select(e.TransactionProposal, () => ({ filter_single: { hash } })))) ??
      (await this.db.query(
        e.insert(e.MessageProposal, {
          account: selectAccount(account),
          hash,
          message,
          label,
          iconUri,
        }),
      ));

    if (signature) await this.approve({ hash, signature });

    return proposal;
  }

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    await this.trySign(input.hash);
  }

  async remove(proposal: Hex) {
    return this.db.query(
      e.delete(e.select(e.MessageProposal, () => ({ filter_single: { hash: proposal } }))).id,
    );
  }

  private async trySign(proposalHash: Hex) {
    const proposal = await this.db.query(
      e.select(e.MessageProposal, () => ({
        filter_single: { hash: proposalHash },
        signature: true,
        approvals: {
          approver: { address: true },
          signature: true,
        },
        account: {
          address: true,
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
      })),
    );
    if (!proposal) return undefined;

    if (proposal.signature) return proposal.signature as Hex;

    const satisfiedPolicy = proposal?.account.policies.find(
      (p) => p.state && proposal.approvals.length >= p.state.threshold,
    );
    const policy = satisfiedPolicy
      ? policyStateAsPolicy(satisfiedPolicy.key, satisfiedPolicy.state)
      : undefined;
    if (!policy) return undefined;

    // TODO: handle expired approvals
    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        this.provider.asApproval({
          digest: proposalHash,
          approver: a.approver.address as Address,
          signature: a.signature as Hex,
        }),
      )
    ).filter(isPresent);

    const signature = encodeAccountSignature(0n, policy, approvals);

    await this.db.query(
      e.update(e.MessageProposal, () => ({
        filter_single: { hash: proposalHash },
        set: { signature },
      })),
    );

    await this.proposals.publishProposal(
      { hash: proposalHash, account: proposal.account.address as Address },
      ProposalEvent.approved,
    );

    return signature;
  }
}
