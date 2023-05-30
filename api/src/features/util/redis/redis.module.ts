import { Module } from '@nestjs/common';
import { CONFIG } from '~/config';
import {
  RedisModule as BaseModule,
  DEFAULT_REDIS_NAMESPACE,
  RedisClientOptions,
} from '@liaoliaots/nestjs-redis';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from '~/decorators/redis.decorator';
import { RedisHealthIndicator } from './redis.indicator';
import { RedisOptions } from 'ioredis';

export const REDIS_OPTIONS = {
  family: CONFIG.redisFamily,
} satisfies RedisOptions;

const config = {
  url: CONFIG.redisUrl,
  ...REDIS_OPTIONS,
} satisfies RedisClientOptions;

@Module({
  imports: [
    BaseModule.forRoot({
      config: [
        {
          namespace: DEFAULT_REDIS_NAMESPACE,
          ...config,
        },
        {
          namespace: REDIS_PUBLISHER,
          ...config,
        },
        {
          namespace: REDIS_SUBSCRIBER,
          ...config,
        },
      ],
    }),
  ],
  exports: [RedisHealthIndicator],
  providers: [RedisHealthIndicator],
})
export class RedisModule {}
