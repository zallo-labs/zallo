import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Worker, TypedJob, QueueReturnType } from '~/features/util/bull/bull.util';
import { NetworksService } from '~/features/util/networks/networks.service';
import { ActivationsService } from './activations.service';
import { ActivationsQueue } from './activations.queue';
import { DatabaseService } from '../database/database.service';
import { selectTransaction } from '../transactions/transactions.service';

@Injectable()
@Processor(ActivationsQueue.name)
export class ActivationsWorker extends Worker<ActivationsQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private activations: ActivationsService,
  ) {
    super();
  }

  async process(job: TypedJob<ActivationsQueue>): Promise<QueueReturnType<ActivationsQueue>> {
    const { account, sponsoringTransaction: tx } = job.data;

    const sponsored = !tx || (await this.db.query(selectTransaction(tx).executable));
    if (!sponsored) return `Sponsoring transaction is not executable: ${tx}`;

    const sim = await this.activations.simulate(account);
    if (!sim) return null;

    const receipt = await this.networks
      .get(account)
      .useWallet(async (wallet) => wallet.writeContract(sim.request));

    return receipt;
  }
}
