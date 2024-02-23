import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TypedJob, Worker, createQueue } from '../util/bull/bull.util';
import { UUID, asAddress, asUAddress, encodeScheduledTransaction, execute } from 'lib';
import { NetworksService } from '../util/networks/networks.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { proposalTxShape, transactionAsTx } from '../transactions/transactions.util';
import { selectTransaction } from '../transactions/transactions.service';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import Decimal from 'decimal.js';

export const SchedulerQueue = createQueue<{ transaction: UUID }>('Scheduled');
export type SchedulerQueue = typeof SchedulerQueue;

@Injectable()
@Processor(SchedulerQueue.name)
export class SchedulerWorker extends Worker<SchedulerQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private paymaster: PaymastersService,
  ) {
    super();
  }

  async process(job: TypedJob<SchedulerQueue>) {
    const selectedProposal = selectTransaction(job.data.transaction);
    const proposal = await this.db.query(
      e.select(selectedProposal, (p) => ({
        account: { address: true },
        simulation: { success: true },
        transaction: { receipt: true },
        isScheduled: p.result.is(e.Scheduled),
        ...proposalTxShape(p),
        maxPaymasterEthFees: { activation: true, total: true },
      })),
    );
    if (!proposal) return 'Proposal not found';
    if (!proposal.simulation) return 'Not simulated';
    if (!proposal.simulation.success) return 'Simulation failed';
    if (!proposal.isScheduled) return 'Not scheduled';

    const account = asUAddress(proposal.account.address);

    return await this.db.transaction(async () => {
      const { paymaster, paymasterInput, ...feeData } = await this.paymaster.usePaymaster({
        account,
        gasLimit: proposal.gasLimit,
        feeToken: asAddress(proposal.feeToken.address),
        maxPaymasterEthFees: {
          activation: new Decimal(proposal.maxPaymasterEthFees.activation),
        },
      });

      // Execute scheduled transaction
      const scheduledTx = await encodeScheduledTransaction({
        network: this.networks.get(account),
        account: asAddress(account),
        tx: transactionAsTx(proposal),
        paymaster,
        paymasterInput,
      });

      // TODO: handle failed transaction execution
      const r = await execute(scheduledTx);
      if (r.isErr()) throw r.error;

      const transaction = r.value.transactionHash;

      await this.db.query(
        e.insert(e.SystemTx, {
          hash: transaction,
          proposal: selectedProposal,
          maxEthFeePerGas: feeData.maxEthFeePerGas.toString(),
          paymasterEthFees: e.insert(e.PaymasterFees, {
            activation: feeData.paymasterEthFees.activation.toString(),
          }),
          ethCreditUsed: feeData.ethCreditUsed.toString(),
          ethPerFeeToken: feeData.tokenPrice.eth.toString(),
          usdPerFeeToken: feeData.tokenPrice.usd.toString(),
        }),
      );

      return transaction;
    });
  }
}
