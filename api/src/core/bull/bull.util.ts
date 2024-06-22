import { BullModule, RegisterQueueOptions } from '@nestjs/bullmq';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { CONFIG } from '~/config';
import { isTruthy } from 'lib';
import { Queue, Worker as BaseWorker, Job, JobType } from 'bullmq';

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
