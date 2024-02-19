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

export const SchedulerQueue = createQueue<{ transactionProposal: UUID }>('Scheduled');
export type SchedulerQueue = typeof SchedulerQueue;

@Injectable()
@Processor(SchedulerQueue.name)
export class SchedulerWorker extends Worker<SchedulerQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
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
      })),
    );
    if (!proposal) return 'Proposal not found';
    if (!proposal.simulation) return 'Not simulated';
    if (!proposal.simulation.success) return 'Simulation failed';
    if (!proposal.transaction) return 'Not scheduled';
    if (proposal.transaction.receipt) return 'Already executed'

    const account = asUAddress(proposal.account.address);

    // Execute scheduled transaction
    const r = await execute(
      await encodeScheduledTransaction({
        network: this.networks.get(account),
        account: asAddress(account),
        tx: transactionProposalAsTx(proposal),
      }),
    );
    if (r.isErr()) throw r.error;

    return r.value.transactionHash;
  }
}
