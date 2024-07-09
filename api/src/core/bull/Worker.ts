import { WorkerHost } from '@nestjs/bullmq';
import { CONFIG } from '~/config';
import { Queue } from 'bullmq';
import { OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { DEFAULT_JOB } from './bull.module';
import { QueueDefintion, TypedWorker, TypedQueue, TypedJob, QueueReturnType } from './bull.util';

export abstract class Worker<Q extends QueueDefintion>
  extends WorkerHost<TypedWorker<Q>>
  implements OnModuleInit, OnModuleDestroy
{
  protected log = new Logger(this.constructor.name);
  queue: TypedQueue<Q>;

  constructor() {
    super();
  }

  abstract process(job: TypedJob<Q>, token?: string): Promise<QueueReturnType<Q>>;

  async onModuleInit() {
    if (!CONFIG.backgroundJobs) {
      this.worker.close();
      return;
    }

    this.queue = new Queue(this.worker.name, {
      connection: await this.worker.client,
      defaultJobOptions: DEFAULT_JOB,
    });

    this.worker.concurrency = 5;

    this.worker.on('failed', (job, err) => {
      this.log.warn(`Job (${job?.id ?? '?'}) failed with ${err.name}: ${err.message}`);
    });

    this.bootstrapAndResume();
  }

  async onModuleDestroy() {
    await this.worker.close(true);
  }

  private async bootstrapAndResume() {
    const isOnlyWorker = (await this.queue.getWorkersCount()) === 1;
    if (isOnlyWorker) await this.bootstrap();

    this.worker.run();
  }

  async bootstrap() {}
}
