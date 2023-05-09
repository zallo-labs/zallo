import { Module } from '@nestjs/common';
import { CONFIG } from '~/config';
import {
  RedisModule as BaseModule,
  DEFAULT_REDIS_NAMESPACE,
  RedisClientOptions,
} from '@liaoliaots/nestjs-redis';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from '~/decorators/redis.decorator';
import { RedisHealthIndicator } from './redis.indicator';

const redisConfig = {
  url: CONFIG.redisUrl,
  family: CONFIG.redisFamily,
} satisfies RedisClientOptions;

@Module({
  imports: [
    BaseModule.forRoot({
      config: [
        {
          namespace: DEFAULT_REDIS_NAMESPACE,
          ...redisConfig,
        },
        {
          namespace: REDIS_PUBLISHER,
          ...redisConfig,
        },
        {
          namespace: REDIS_SUBSCRIBER,
          ...redisConfig,
        },
      ],
    }),
  ],
  exports: [RedisHealthIndicator],
  providers: [RedisHealthIndicator],
})
export class RedisModule {}
