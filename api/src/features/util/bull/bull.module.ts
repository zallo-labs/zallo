import { Module } from '@nestjs/common';
import { BullModule as BaseModule } from '@nestjs/bullmq';
import { DEFAULT_REDIS_NAMESPACE, RedisService } from '@songkeys/nestjs-redis';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BasicAuthMiddleware } from './basic-auth.middlware';
import { BULL_BOARD_ENABLED } from './bull.util';
import { isTruthy } from 'lib';
import { DefaultJobOptions, FlowOpts, QueueOptions } from 'bullmq';
import { REDIS_CONFIG } from '../redis/redis.module';

export const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: 1000,
  removeOnFail: 1000, // Prevents OOM
  attempts: 18, // 2^18 * 200ms = ~14.5h
  backoff: { type: 'exponential', delay: 200 },
} satisfies DefaultJobOptions;

const flowQueueOpts: Partial<QueueOptions> = { defaultJobOptions: DEFAULT_JOB_OPTIONS };
export const DEFAULT_FLOW_OPTIONS: FlowOpts = {
  // Return default job options for all queues
  queuesOptions: new Proxy({}, { get: () => flowQueueOpts }),
};

@Module({
  imports: [
    BaseModule.forRootAsync({
      inject: [RedisService],

      useFactory: (redisService: RedisService) => ({
        // TODO: re-enable shared client once graphql-redis-subscriptions is updated (it doesn't support latest ioredis which bullmq requires)
        // connection: redisService.getClient(DEFAULT_REDIS_NAMESPACE),
        connection: REDIS_CONFIG,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      }),
    }),
    BULL_BOARD_ENABLED &&
      BullBoardModule.forRoot({
        route: '/queues',
        adapter: ExpressAdapter,
        middleware: BasicAuthMiddleware,
      }),
  ].filter(isTruthy),
})
export class BullModule {}
