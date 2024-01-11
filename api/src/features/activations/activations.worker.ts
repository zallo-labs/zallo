import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Worker, TypedJob, QueueReturnType } from '~/features/util/bull/bull.util';
import { NetworksService } from '~/features/util/networks/networks.service';
import { ActivationsService } from './activations.service';
import { ActivationsQueue } from './activations.queue';

@Injectable()
@Processor(ActivationsQueue.name)
export class ActivationsWorker extends Worker<ActivationsQueue> {
  constructor(
    private networks: NetworksService,
    private activations: ActivationsService,
  ) {
    super();
  }

  async process(job: TypedJob<ActivationsQueue>): Promise<QueueReturnType<ActivationsQueue>> {
    const { account } = job.data;

    const sim = await this.activations.simulate(account);
    if (!sim) return null;

    const transaction = await this.networks
      .get(account)
      .useWallet(async (wallet) => wallet.writeContract(sim.request));

    return transaction;
  }
}
