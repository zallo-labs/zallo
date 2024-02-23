import { Injectable } from '@nestjs/common';
import { isPresent, getTransactionSatisfiability, asAddress } from 'lib';
import { policyStateAsPolicy, policyStateShape } from '../policies/policies.util';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { proposalTxShape, transactionAsTx } from '../transactions/transactions.util';
import { UniqueProposal } from '../proposals/proposals.service';

@Injectable()
export class SystemTxsService {
  constructor(private db: DatabaseService) {}

  async satisfiablePolicies(id: UniqueProposal) {
    const proposal = await this.db.query(
      e.select(e.Transaction, (p) => ({
        filter_single: { id },
        ...proposalTxShape(p),
        approvals: {
          approver: { address: true },
        },
        rejections: {
          approver: { address: true },
        },
        account: {
          id: true,
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
      })),
    );
    if (!proposal) throw new Error(`Proposal ${id} not found`);

    const tx = transactionAsTx(proposal);

    const approvals = new Set(proposal.approvals.map((a) => asAddress(a.approver.address)));
    const rejections = new Set(proposal.rejections.map((a) => asAddress(a.approver.address)));

    const policies = proposal.account.policies
      .map((policy) => policyStateAsPolicy(policy.key, policy.state))
      .filter(isPresent)
      .map((policy) => ({
        policy,
        satisfiability: getTransactionSatisfiability(policy, tx, approvals),
      }));

    return { accountId: proposal.account.id, policies, approvals, rejections };
  }
}
