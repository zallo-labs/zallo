import { BullModule as BullMqModule, RegisterQueueOptions, WorkerHost } from '@nestjs/bullmq';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { CONFIG } from '~/config';
import { isTruthy } from 'lib';
import { JobStatus } from 'bull';
import { Queue, Worker as BaseWorker, Job } from 'bullmq';
import { OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

export const BULL_BOARD_CREDS =
  CONFIG.bullBoardUser && CONFIG.bullBoardPassword
    ? {
        username: CONFIG.bullBoardUser,
        password: CONFIG.bullBoardPassword,
      }
    : undefined;

export const BULL_BOARD_ENABLED = !!BULL_BOARD_CREDS;

export function registerBullQueue(...queues: (RegisterQueueOptions & { name: string })[]) {
  return [
    BullMqModule.registerQueue(...queues),
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
  'waiting',
  'active',
  'delayed',
  'paused',
] satisfies JobStatus[];

export interface QueueDefintion<Data = unknown, ReturnType = unknown>
  extends Omit<RegisterQueueOptions, 'name'> {
  name: string;
}

export const createQueue = <Data, ReturnType = unknown>(
  name: string,
  options?: Omit<RegisterQueueOptions, 'name'>,
): QueueDefintion<Data, ReturnType> => ({ ...options, name });

export type TypedQueue<Q extends QueueDefintion> = Queue<QueueData<Q>, QueueReturnType<Q>, string>;

export type TypedWorker<Q extends QueueDefintion<unknown, unknown>> = Q extends QueueDefintion<
  infer Data,
  infer ReturnType
>
  ? BaseWorker<Data, ReturnType, string>
  : never;

export type TypedJob<Q extends QueueDefintion<unknown, unknown>> = Q extends QueueDefintion<
  infer Data,
  infer ReturnType
>
  ? Job<Data, ReturnType, string>
  : never;

export type QueueData<Q extends QueueDefintion<unknown, unknown>> = Q extends QueueDefintion<
  infer Data,
  unknown
>
  ? Data
  : never;

export type QueueReturnType<Q extends QueueDefintion<unknown, unknown>> = Q extends QueueDefintion<
  unknown,
  infer ReturnType
>
  ? ReturnType
  : never;

export abstract class Worker<Q extends QueueDefintion>
  extends WorkerHost<TypedWorker<Q>>
  implements OnModuleInit, OnModuleDestroy
{
  protected log = new Logger(this.constructor.name);

  constructor() {
    super();
  }

  abstract process(job: TypedJob<Q>, token?: string): Promise<QueueReturnType<Q>>;

  onModuleInit() {
    this.worker.on('failed', (job, err) => {
      this.log.warn(`Job (${job?.id ?? '?'}) failed with: ${err.name}`);
    });
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
