import { InjectQueue, Processor } from '@nestjs/bullmq';
import { WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import {
  Address,
  Hex,
  Tx,
  asAddress,
  asApproval,
  asHex,
  asUAddress,
  estimateTransactionTotalGas,
  executeTransaction,
  getTransactionSatisfiability,
  isPresent,
  mapAsync,
} from 'lib';
import { DatabaseService } from '~/features/database/database.service';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import { ProposalsService } from '~/features/proposals/proposals.service';
import { TRANSACTIONS_QUEUE, TransactionEvent } from '~/features/transactions/transactions.queue';
import { NetworksService } from '~/features/util/networks/networks.service';
import e from '~/edgeql-js';
import {
  PolicyStateShape,
  policyStateAsPolicy,
  policyStateShape,
  selectPolicy,
} from '~/features/policies/policies.util';
import {
  proposalTxShape,
  transactionProposalAsTx,
} from '../transaction-proposals/transaction-proposals.util';
import Decimal from 'decimal.js';
import { selectApprover } from '~/features/approvers/approvers.service';
import { ProposalEvent } from '~/features/proposals/proposals.input';
import { selectTransactionProposal } from '~/features/transaction-proposals/transaction-proposals.service';
import { TypedJob, TypedWorker, createQueue } from '~/features/util/bull/bull.util';

export const EXECUTIONS_QUEUE = createQueue<{ txProposalHash: Hex }, Hex | undefined>()<string>(
  'Executions',
);

@Injectable()
@Processor(EXECUTIONS_QUEUE.name)
export class ExecutionsWorker extends WorkerHost<TypedWorker<typeof EXECUTIONS_QUEUE>> {
  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private transactionsQueue: Queue<TransactionEvent>,
    private proposals: ProposalsService,
    private paymaster: PaymastersService,
  ) {
    super();
  }

  async process(job: TypedJob<typeof EXECUTIONS_QUEUE>) {
    const hash = job.data.txProposalHash;
    const proposal = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter_single: { hash },
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
        paymasterEthFee: true,
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
    if (!proposal || (proposal.status !== 'Pending' && proposal.status !== 'Failed')) return;
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
      return job.retry();
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
    const transaction = await this.db.transaction(async (db) => {
      const { paymaster, paymasterInput, ...feeData } = await this.paymaster.currentParams({
        account,
        gasLimit: new Decimal(tx.gas.toString()),
        feeToken: asAddress(proposal.feeToken.address),
        paymasterEthFee: new Decimal(proposal.paymasterEthFee),
      });
      const transactionResult = await executeTransaction({
        network,
        account: asAddress(account),
        tx,
        policy,
        approvals,
        paymaster,
        paymasterInput,
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
      await e
        .insert(e.Transaction, {
          hash: transaction,
          proposal: selectedProposal,
          maxEthFeePerGas: feeData.maxEthFeePerGas.toString(),
          ethDiscount: feeData.ethDiscount.toString(),
          ethPerFeeToken: feeData.tokenPrice.eth.toString(),
          usdPerFeeToken: feeData.tokenPrice.usd.toString(),
        })
        .run(db);
      return transaction;
    });
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
