import { Module } from '@nestjs/common';
import { BullModule as BaseModule } from '@nestjs/bull';
import { DEFAULT_REDIS_NAMESPACE, RedisService } from '@songkeys/nestjs-redis';
import { REDIS_SUBSCRIBER } from '~/decorators/redis.decorator';
import { match } from 'ts-pattern';
import Redis from 'ioredis';
import { REDIS_CONFIG } from '../redis/redis.module';
import { CONFIG } from '~/config';
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
        createClient: (type) =>
          match(type)
            .with('client', () => redisService.getClient(DEFAULT_REDIS_NAMESPACE))
            .with('subscriber', () => redisService.getClient(REDIS_SUBSCRIBER))
            .with('bclient', () => new Redis(CONFIG.redisUrl, REDIS_CONFIG)) // Blocking client - one required each queue
            .exhaustive(),
        defaultJobOptions: {
          removeOnComplete: true,
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
