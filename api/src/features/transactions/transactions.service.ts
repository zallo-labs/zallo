import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  executeTransaction,
  asHex,
  mapAsync,
  isPresent,
  Tx,
  Address,
  Hex,
  getTransactionSatisfiability,
  isHex,
  estimateTransactionTotalGas,
  asApproval,
  asAddress,
  asUAddress,
} from 'lib';
import { NetworksService } from '~/features/util/networks/networks.service';
import { selectTransactionProposal } from '../transaction-proposals/transaction-proposals.service';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import {
  policyStateAsPolicy,
  PolicyStateShape,
  policyStateShape,
  selectPolicy,
} from '../policies/policies.util';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { UserInputError } from '@nestjs/apollo';
import { PaymastersService } from '../paymasters/paymasters.service';
import {
  proposalTxShape,
  transactionProposalAsTx,
} from '../transaction-proposals/transaction-proposals.util';
import { selectApprover } from '../approvers/approvers.service';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';

@Injectable()
export class TransactionsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private transactionsQueue: Queue<TransactionEvent>,
    private proposals: ProposalsService,
    private paymaster: PaymastersService,
  ) {}

  async selectUnique(txHash: Hex, shape?: ShapeFunc<typeof e.Transaction>) {
    return this.db.query(
      e.select(e.Transaction, (t) => ({
        filter_single: { hash: txHash },
        ...shape?.(t),
      })),
    );
  }

  async tryExecute(uniqueProposal: UniqueProposal) {
    const proposal = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter_single: isHex(uniqueProposal) ? { hash: uniqueProposal } : { id: uniqueProposal },
        id: true,
        account: {
          address: true,
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
        hash: true,
        ...proposalTxShape(p),
        feeToken: { address: true },
        paymasterFee: true,
        approvals: {
          approver: { address: true },
          signature: true,
        },
        policy: {
          key: true,
          state: policyStateShape,
        },
        status: true,
      })),
    );
    if (!proposal) throw new UserInputError(`Proposal ${uniqueProposal} not found`);
    if (proposal.status !== 'Pending' && proposal.status !== 'Failed')
      throw new UserInputError(`Proposal ${uniqueProposal} must be pending or failed to execute`);

    const account = asUAddress(proposal.account.address);
    const network = this.networks.for(account);

    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        asApproval({
          network,
          hash: asHex(proposal.hash),
          approver: asAddress(a.approver.address),
          signature: asHex(a.signature),
        }),
      )
    ).filter(isPresent);

    if (approvals.length !== proposal.approvals.length) {
      const expiredApprovals = proposal.approvals
        .map((a) => asAddress(a.approver.address))
        .filter((a) => !approvals.find((approval) => approval.approver === a));

      // TODO: Mark approvals as expired rather than removing
      await e
        .for(e.set(...expiredApprovals.map((approver) => selectApprover(approver))), (approver) =>
          e.delete(e.Approval, () => ({
            filter_single: { proposal: selectTransactionProposal(proposal.id), approver },
          })),
        )
        .run(this.db.DANGEROUS_superuserClient);

      return this.tryExecute(proposal.id);
    }

    const tx = {
      ...transactionProposalAsTx(proposal),
      gas: estimateTransactionTotalGas(proposal.gasLimit, approvals.length),
    };

    const policy = await this.getExecutionPolicy(
      tx,
      new Set(approvals.map((a) => a.approver)),
      proposal.policy,
      proposal.account.policies,
    );
    if (!policy) return undefined;

    const maxFeePerGas = (await network.estimateFeesPerGas()).maxFeePerGas!;
    const transactionResult = await executeTransaction({
      network,
      account: asAddress(account),
      tx,
      policy,
      approvals,
      ...(await this.paymaster.getCurrentParams({
        account,
        zksyncNonce: BigInt(await network.getTransactionCount({ address: asAddress(account) })),
        gas: tx.gas,
        feeToken: asAddress(proposal.feeToken.address),
        paymasterFee: proposal.paymasterFee,
      }))!,
    });
    const transaction = transactionResult._unsafeUnwrap(); // TODO: handle failed transaction submission

    // Set executing policy if not already set
    const selectedProposal = proposal.policy?.state
      ? selectTransactionProposal(proposal.id)
      : e.update(e.TransactionProposal, () => ({
          filter_single: { id: proposal.id },
          set: {
            policy: selectPolicy({ account, key: policy.key }),
          },
        }));

    await this.db.query(
      e.insert(e.Transaction, {
        hash: transaction,
        proposal: selectedProposal,
        gasPrice: maxFeePerGas,
      }),
    );

    await this.proposals.publishProposal(
      { hash: asHex(proposal.hash), account: asUAddress(proposal.account.address) },
      ProposalEvent.submitted,
    );

    await this.transactionsQueue.add(
      { chain: network.chain.key, transaction },
      { delay: 2000 /* 2s */ },
    );

    return transaction;
  }

  async satisfiablePolicies(id: UniqueProposal) {
    const proposal = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter_single: isHex(id) ? { hash: id } : { id },
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

    const tx = transactionProposalAsTx(proposal);

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

  private async getExecutionPolicy(
    tx: Tx,
    approvals: Set<Address>,
    proposalPolicy: { key: number; state: PolicyStateShape } | null,
    accountPolicies: { key: number; state: PolicyStateShape }[],
  ) {
    if (proposalPolicy) {
      // Only execute with proposal policy if specified
      const p = policyStateAsPolicy(proposalPolicy.key, proposalPolicy.state);
      if (p && getTransactionSatisfiability(p, tx, approvals).result === 'satisfied') return p;
    } else {
      return accountPolicies
        .map((policy) => policyStateAsPolicy(policy.key, policy.state))
        .find(
          (policy) =>
            policy && getTransactionSatisfiability(policy, tx, approvals).result === 'satisfied',
        );
    }
  }
}
