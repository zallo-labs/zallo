import { BullModule, RegisterQueueOptions, WorkerHost } from '@nestjs/bullmq';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { CONFIG } from '~/config';
import { isTruthy } from 'lib';
import { Queue, Worker as BaseWorker, Job, JobType } from 'bullmq';
import { OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

export const BULL_BOARD_CREDS =
  CONFIG.bullBoardUser !== undefined && CONFIG.bullBoardPassword !== undefined
    ? {
        username: CONFIG.bullBoardUser,
        password: CONFIG.bullBoardPassword,
      }
    : undefined;

export const BULL_BOARD_ENABLED = !!BULL_BOARD_CREDS;

export function registerBullQueue(...queues: (RegisterQueueOptions & { name: string })[]) {
  return [
    BullModule.registerQueue(...queues),
    BULL_BOARD_ENABLED &&
      BullBoardModule.forFeature(
        ...queues.map(
          (q): BullBoardQueueOptions => ({
            name: q.name,
            adapter: BullMQAdapter,
          }),
        ),
      ),
  ].filter(isTruthy);
}

export const RUNNING_JOB_STATUSES = [
  'paused',
  'delayed',
  'waiting-children',
  'wait',
  'waiting',
  'active',
  'prioritized',
  'repeat',
] satisfies JobType[];

export const FLOW_PRODUCER = 'Flows' as const;
export const registerFlowsProducer = () => BullModule.registerFlowProducer({ name: FLOW_PRODUCER });

export interface QueueDefintion<Data = unknown, ReturnType = unknown>
  extends Omit<RegisterQueueOptions, 'name'> {
  name: string;
}

export const createQueue = <Data, ReturnType = unknown>(
  name: string,
  options?: Omit<RegisterQueueOptions, 'name'>,
): QueueDefintion<Data, ReturnType> => ({ ...options, name });

export type TypedQueue<Q extends QueueDefintion> = Queue<QueueData<Q>, QueueReturnType<Q>, string>;

export type TypedWorker<Q extends QueueDefintion<unknown, unknown>> =
  Q extends QueueDefintion<infer Data, infer ReturnType>
    ? BaseWorker<Data, ReturnType, string>
    : never;

export type TypedJob<Q extends QueueDefintion<unknown, unknown>> =
  Q extends QueueDefintion<infer Data, infer ReturnType> ? Job<Data, ReturnType, string> : never;

export type QueueData<Q extends QueueDefintion<unknown, unknown>> =
  Q extends QueueDefintion<infer Data, unknown> ? Data : never;

export type QueueReturnType<Q extends QueueDefintion<unknown, unknown>> =
  Q extends QueueDefintion<unknown, infer ReturnType> ? ReturnType : never;

export abstract class Worker<Q extends QueueDefintion>
  extends WorkerHost<TypedWorker<Q>>
  implements OnModuleInit, OnModuleDestroy
{
  protected log = new Logger(this.constructor.name);
  protected queue: TypedQueue<Q>;

  constructor() {
    super();
  }

  abstract process(job: TypedJob<Q>, token?: string): Promise<QueueReturnType<Q>>;

  async onModuleInit() {
    if (!CONFIG.processEvents) {
      this.worker.close();
      return;
    }

    this.queue = new Queue(this.worker.name, { connection: await this.worker.client });

    this.worker.concurrency = 5;

    this.worker.on('failed', (job, err) => {
      this.log.warn(`Job (${job?.id ?? '?'}) failed with ${err.name}: ${err.message}`);
    });

    this.bootstrapAndResume();
  }

  async onModuleDestroy() {
    await this.worker.close();
  }

  private async bootstrapAndResume() {
    const isOnlyWorker = (await this.queue.getWorkersCount()) === 1;
    if (isOnlyWorker) await this.bootstrap();

    this.worker.run();
  }

  async bootstrap() {}
}
