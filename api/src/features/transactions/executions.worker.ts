import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  UUID,
  asAddress,
  asApproval,
  asDecimal,
  asHex,
  asUAddress,
  encodeTransaction,
  encodeTransactionSignature,
  execute,
  isPresent,
  mapAsync,
} from 'lib';
import { DatabaseService } from '~/features/database/database.service';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import { ProposalsService } from '~/features/proposals/proposals.service';
import { NetworksService } from '~/features/util/networks/networks.service';
import e from '~/edgeql-js';
import {
  policyStateAsPolicy,
  policyStateShape,
  selectPolicy,
} from '~/features/policies/policies.util';
import { TX_SHAPE, transactionAsTx } from './transactions.util';
import Decimal from 'decimal.js';
import { ProposalEvent } from '~/features/proposals/proposals.input';
import { selectTransaction } from '~/features/transactions/transactions.service';
import { QueueReturnType, TypedJob, Worker, createQueue } from '~/features/util/bull/bull.util';
import { ETH } from 'lib/dapps';
import { UnrecoverableError } from 'bullmq';

export const ExecutionsQueue = createQueue<{ txProposal: UUID; ignoreSimulation?: boolean }>(
  'Executions',
);
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
      e.select(e.Transaction, () => ({
        filter_single: { id },
        id: true,
        account: { address: true },
        hash: true,
        ...TX_SHAPE,
        status: true,
        executable: true,
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
        simulation: {
          success: true,
          timestamp: true,
        },
      })),
    );
    if (!proposal) return 'proposal not found';
    if (proposal.status !== 'Pending' && proposal.status !== 'Executing')
      return `Can't execute transaction with status ${proposal.status}`;

    if (!ignoreSimulation && !proposal.simulation?.success) return 'simulation failed';
    if (!proposal.executable) return 'not executable';

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
    if (approvals.length !== proposal.approvals.length)
      throw new UnrecoverableError('Approval expired'); // TODO: handle expiring approvals

    const tx = transactionAsTx(proposal);
    const policy = policyStateAsPolicy(proposal.policy.key, proposal.policy.state);
    if (!policy) return fail('policy not active');

    return await this.db.transaction(async () => {
      const { paymaster, paymasterInput, ...feeData } = await this.paymaster.usePaymaster({
        account,
        gasLimit: tx.gas!,
        feeToken: asAddress(proposal.feeToken.address),
        maxPaymasterEthFees: {
          activation: new Decimal(proposal.maxPaymasterEthFees.activation),
        },
      });

      const execution = await execute(
        await encodeTransaction({
          network,
          account: asAddress(account),
          tx,
          paymaster,
          paymasterInput,
          customSignature: encodeTransactionSignature({ tx, policy, approvals }),
        }),
      );

      if (execution.isErr()) {
        await this.db.query(
          e.insert(e.Failed, {
            transaction: selectTransaction(id),
            block: network.blockNumber(),
            gasUsed: 0n,
            ethFeePerGas: asDecimal(await network.getGasPrice(), ETH).toString(),
            reason: execution.error.message,
          }),
        );

        return execution.error;
      }

      const hash = execution.value.transactionHash;

      // Set executing policy if not already set; the insert trigger breaks if this is done in the same query as the insert
      if (!proposal.policy) {
        await this.db.query(
          e.update(e.Transaction, () => ({
            filter_single: { id: proposal.id },
            set: {
              policy: selectPolicy({ account, key: policy.key }),
            },
          })),
        );
      }

      await this.db.query(
        e.insert(e.SystemTx, {
          hash,
          proposal: selectTransaction(id),
          maxEthFeePerGas: feeData.maxEthFeePerGas.toString(),
          paymasterEthFees: e.insert(e.PaymasterFees, {
            activation: feeData.paymasterEthFees.activation.toString(),
          }),
          ethCreditUsed: feeData.ethCreditUsed.toString(),
          ethPerFeeToken: feeData.tokenPrice.eth.toString(),
          usdPerFeeToken: feeData.tokenPrice.usd.toString(),
        }),
      );

      this.db.afterTransaction(() =>
        this.proposals.publish({ id, account }, ProposalEvent.submitted),
      );

      return hash;
    });
  }
}
