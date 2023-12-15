import { Module } from '@nestjs/common';
import { BullModule as BaseModule } from '@nestjs/bullmq';
import { DEFAULT_REDIS_NAMESPACE, RedisService } from '@songkeys/nestjs-redis';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BasicAuthMiddleware } from './basic-auth.middlware';
import { BULL_BOARD_ENABLED } from './bull.util';
import { isTruthy } from 'lib';

@Module({
  imports: [
    BaseModule.forRootAsync({
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        connection: redisService.getClient(DEFAULT_REDIS_NAMESPACE),
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: false,
          attempts: 18, // 2^18 * 200ms = ~14.5h
          backoff: { type: 'exponential', delay: 200 },
        },
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
