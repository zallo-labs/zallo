import { BullModuleOptions } from '@nestjs/bull';
import { BullModule } from '@nestjs/bull';
import { BullModule as BullMqModule, RegisterQueueOptions } from '@nestjs/bullmq';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { CONFIG } from '~/config';
import { isTruthy } from 'lib';
import { JobStatus } from 'bull';
import { Queue, Worker, Job } from 'bullmq';

export const BULL_BOARD_CREDS =
  CONFIG.bullBoardUser && CONFIG.bullBoardPassword
    ? {
        username: CONFIG.bullBoardUser,
        password: CONFIG.bullBoardPassword,
      }
    : undefined;

export const BULL_BOARD_ENABLED = !!BULL_BOARD_CREDS;

export const registerBullQueue = (...queues: (BullModuleOptions & { name: string })[]) =>
  [
    BullModule.registerQueue(...queues),
    BULL_BOARD_ENABLED &&
      BullBoardModule.forFeature(
        ...queues.map(
          (q): BullBoardQueueOptions => ({
            name: q.name,
            adapter: BullAdapter,
          }),
        ),
      ),
  ].filter(isTruthy);

export function registerBullMqQueue(...queues: (RegisterQueueOptions & { name: string })[]) {
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

export interface QueueDefintion<Data, ReturnType, Name extends string>
  extends Omit<RegisterQueueOptions, 'name'> {
  name: Name;
}

// Currying is required for partial type inference - https://github.com/microsoft/TypeScript/issues/26242
export const createQueue =
  <Data, ReturnType = unknown>() =>
  <const Name extends string>(
    name: Name,
    options?: RegisterQueueOptions,
  ): QueueDefintion<Data, ReturnType, Name> => ({ ...options, name });

export type TypedQueue<Q extends QueueDefintion<unknown, unknown, string>> =
  Q extends QueueDefintion<infer Data, infer ReturnType, infer Name>
    ? Queue<Data, ReturnType, Name>
    : never;

export type TypedWorker<Q extends QueueDefintion<unknown, unknown, string>> =
  Q extends QueueDefintion<infer Data, infer ReturnType, infer Name>
    ? Worker<Data, ReturnType, Name>
    : never;

export type TypedJob<Q extends QueueDefintion<unknown, unknown, string>> = Q extends QueueDefintion<
  infer Data,
  infer ReturnType,
  infer Name
>
  ? Job<Data, ReturnType, Name>
  : never;
