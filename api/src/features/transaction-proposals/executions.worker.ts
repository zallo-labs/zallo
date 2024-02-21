import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  Address,
  Hex,
  Tx,
  UUID,
  asAddress,
  asApproval,
  asHex,
  asUAddress,
  encodeTransaction,
  encodeTransactionSignature,
  execute,
  getTransactionSatisfiability,
  isPresent,
  mapAsync,
} from 'lib';
import { DatabaseService } from '~/features/database/database.service';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import { ProposalsService } from '~/features/proposals/proposals.service';
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
import { QueueReturnType, TypedJob, Worker, createQueue } from '~/features/util/bull/bull.util';
import { UnrecoverableError } from 'bullmq';

export const ExecutionsQueue = createQueue<
  { txProposal: UUID; ignoreSimulation?: boolean },
  Hex | string
>('Executions');
export type ExecutionsQueue = typeof ExecutionsQueue;

@Injectable()
@Processor(ExecutionsQueue.name)
export class ExecutionsWorker extends Worker<ExecutionsQueue> {
  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private proposals: ProposalsService,
    private paymaster: PaymastersService,
  ) {
    super();
  }

  async process(job: TypedJob<ExecutionsQueue>): Promise<QueueReturnType<ExecutionsQueue>> {
    const { txProposal: id, ignoreSimulation } = job.data;
    const proposal = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter_single: { id },
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
        maxPaymasterEthFees: {
          total: true,
          activation: true,
        },
        approvals: (a) => ({
          filter: e.op('not', a.invalid),
          approver: { address: true },
          signature: true,
        }),
        policy: {
          key: true,
          state: policyStateShape,
        },
        transaction: true,
        simulation: {
          success: true,
          timestamp: true,
        },
      })),
    );
    if (!proposal) return 'proposal not found';
    if (proposal.transaction) return 'already executed';

    // Require simulation to have succeed, unless ignored
    if (!ignoreSimulation) {
      if (!proposal.simulation)
        throw new UnrecoverableError('Simulation was not found and is required to execute');
      if (!proposal.simulation.success) return 'simulation failed';
    }

    const account = asUAddress(proposal.account.address);
    const network = this.networks.get(account);

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
            filter_single: { proposal: selectTransactionProposal(id), approver },
          })),
        )
        .run(this.db.DANGEROUS_superuserClient);
      job.retry();
      return 'retry';
    }

    const tx = transactionProposalAsTx(proposal);
    const policy = await this.getExecutionPolicy(
      tx,
      new Set(approvals.map((a) => a.approver)),
      proposal.policy,
      proposal.account.policies,
    );
    if (!policy) return 'no suitable policy';

    return await this.db.transaction(async (db) => {
      const { paymaster, paymasterInput, ...feeData } = await this.paymaster.usePaymaster({
        account,
        gasLimit: tx.gas!,
        feeToken: asAddress(proposal.feeToken.address),
        maxPaymasterEthFees: {
          activation: new Decimal(proposal.maxPaymasterEthFees.activation),
        },
      });

      const transactionResult = await execute(
        await encodeTransaction({
          network,
          account: asAddress(account),
          tx,
          paymaster,
          paymasterInput,
          customSignature: encodeTransactionSignature({ tx, policy, approvals }),
        }),
      );

      // TODO: handle failed transaction execution
      if (transactionResult.isErr()) throw transactionResult.error;

      const transaction = transactionResult.value.transactionHash;

      // Set executing policy if not already set
      const selectedProposal = proposal.policy?.state
        ? selectTransactionProposal(id)
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
          paymasterEthFees: e.insert(e.PaymasterFees, {
            activation: feeData.paymasterEthFees.activation.toString(),
          }),
          ethCreditUsed: feeData.ethCreditUsed.toString(),
          ethPerFeeToken: feeData.tokenPrice.eth.toString(),
          usdPerFeeToken: feeData.tokenPrice.usd.toString(),
        })
        .run(db);

      this.db.afterTransaction(() =>
        this.proposals.publishProposal({ id, account }, ProposalEvent.submitted),
      );

      return transaction;
    });
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
