import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NetworksService, estimatedFeesPerGasKey } from './networks.service';
import { Chain } from 'chains';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { RUNNING_JOB_STATUSES, TypedJob, createQueue } from '../bull/bull.util';
import { Worker } from '../bull/Worker';
import { NON_RETRYING_JOB } from '../bull/bull.module';

export const NetworkQueue = createQueue<EventJobData>('Network');
export type NetworkQueue = typeof NetworkQueue;

interface EventJobData {
  chain: Chain;
}

@Injectable()
@Processor(NetworkQueue.name, { autorun: false })
export class NetworkWorker extends Worker<NetworkQueue> {
  constructor(
    private networks: NetworksService,
    @InjectRedis() private redis: Redis,
  ) {
    super();
  }

  async process(job: TypedJob<NetworkQueue>) {
    const { chain } = job.data;

    const newFees = await this.networks.get(chain).estimateFeesPerGas();
    this.redis.set(estimatedFeesPerGasKey(chain), JSON.stringify(newFees), 'EX', 60);
  }

  async bootstrap() {
    const runningJobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    for await (const network of this.networks) {
      if (runningJobs.find((j) => j.data.chain === network.chain.key)) continue;

      const chain = network.chain.key;
      this.queue.add(chain, { chain }, { repeat: { every: 2_000 /* ms */ }, ...NON_RETRYING_JOB });
    }
  }
}
