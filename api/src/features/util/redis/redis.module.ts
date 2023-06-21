import { Module } from '@nestjs/common';
import { CONFIG } from '~/config';
import {
  RedisModule as BaseModule,
  RedisClientOptions,
  DEFAULT_REDIS_NAMESPACE,
} from '@liaoliaots/nestjs-redis';
import { REDIS_SUBSCRIBER } from '~/decorators/redis.decorator';
import { RedisHealthIndicator } from './redis.indicator';

export const REDIS_CONFIG = {
  url: CONFIG.redisUrl,
  family: CONFIG.redisFamily,
  tls: { rejectUnauthorized: false },
  enableReadyCheck: false, // Required due to https://github.com/OptimalBits/bull/issues/1873
  maxRetriesPerRequest: null, // ^^
} satisfies RedisClientOptions;

@Module({
  imports: [
    BaseModule.forRoot({
      config: [
        {
          namespace: DEFAULT_REDIS_NAMESPACE,
          ...REDIS_CONFIG,
        },
        {
          namespace: REDIS_SUBSCRIBER,
          ...REDIS_CONFIG,
        },
      ],
    }),
  ],
  exports: [RedisHealthIndicator],
  providers: [RedisHealthIndicator],
})
export class RedisModule {}
