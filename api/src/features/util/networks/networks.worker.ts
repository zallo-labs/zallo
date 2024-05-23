import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NetworksService, estimatedFeesPerGasKey } from './networks.service';
import { Chain } from 'chains';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { RUNNING_JOB_STATUSES, Worker, TypedJob, createQueue, TypedQueue } from '../bull/bull.util';
import { runOnce } from '~/util/mutex';

export const NetworkQueue = createQueue<EventJobData>('Network');
export type NetworkQueue = typeof NetworkQueue;

interface EventJobData {
  chain: Chain;
}

@Injectable()
@Processor(NetworkQueue.name)
export class NetworkWorker extends Worker<NetworkQueue> {
  constructor(
    @InjectQueue(NetworkQueue.name)
    private queue: TypedQueue<NetworkQueue>,
    private networks: NetworksService,
    @InjectRedis() private redis: Redis,
  ) {
    super();
  }

  onModuleInit() {
    super.onModuleInit();
    this.addMissingJob();
  }

  async process(job: TypedJob<NetworkQueue>) {
    const { chain } = job.data;

    const newFees = await this.networks.get(chain).estimateFeesPerGas();
    this.redis.set(estimatedFeesPerGasKey(chain), JSON.stringify(newFees), 'EX', 60);
  }

  private async addMissingJob() {
    await runOnce(
      async () => {
        const runningJobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

        for await (const network of this.networks) {
          if (runningJobs.find((j) => j.data.chain === network.chain.key)) continue;

          const chain = network.chain.key;
          this.queue.add(chain, { chain }, { repeat: { every: 30_000 /* ms */ } });
        }
      },
      {
        redis: this.redis,
        key: 'network-missing-job',
      },
    );
  }
}
