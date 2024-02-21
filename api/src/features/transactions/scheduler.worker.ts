import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TypedJob, Worker, createQueue } from '../util/bull/bull.util';
import { UUID, asAddress, asUAddress, encodeScheduledTransaction, execute } from 'lib';
import { NetworksService } from '../util/networks/networks.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import {
  proposalTxShape,
  transactionProposalAsTx,
} from '../transaction-proposals/transaction-proposals.util';
import { selectTransactionProposal } from '../transaction-proposals/transaction-proposals.service';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import Decimal from 'decimal.js';

export const SchedulerQueue = createQueue<{ transactionProposal: UUID }>('Scheduled');
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
    const proposal = await this.db.query(
      e.select(selectTransactionProposal(job.data.transactionProposal), (p) => ({
        account: { address: true },
        simulation: { success: true },
        transaction: { receipt: true },
        ...proposalTxShape(p),
        maxPaymasterEthFees: { activation: true, total: true },
      })),
    );
    if (!proposal) return 'Proposal not found';
    if (!proposal.simulation) return 'Not simulated';
    if (!proposal.simulation.success) return 'Simulation failed';
    if (!proposal.transaction) return 'Not scheduled';
    if (proposal.transaction.receipt) return 'Already executed';

    const account = asUAddress(proposal.account.address);

    return await this.db.transaction(async () => {
      const { paymaster, paymasterInput } = await this.paymaster.usePaymaster({
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
        tx: transactionProposalAsTx(proposal),
        paymaster,
        paymasterInput,
      });

      const r = await execute(scheduledTx);
      if (r.isErr()) throw r.error;

      return r.value.transactionHash;
    });
  }
}
