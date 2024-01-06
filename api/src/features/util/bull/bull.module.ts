import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule as BaseModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DEFAULT_REDIS_NAMESPACE, RedisService } from '@songkeys/nestjs-redis';
import { DefaultJobOptions } from 'bullmq';

import { isTruthy } from 'lib';
import { BasicAuthMiddleware } from './basic-auth.middlware';
import { BULL_BOARD_ENABLED } from './bull.util';

export const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: 1000,
  removeOnFail: false,
  attempts: 18, // 2^18 * 200ms = ~14.5h
  backoff: { type: 'exponential', delay: 200 },
} satisfies DefaultJobOptions;

@Module({
  imports: [
    BaseModule.forRootAsync({
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        connection: redisService.getClient(DEFAULT_REDIS_NAMESPACE),
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
