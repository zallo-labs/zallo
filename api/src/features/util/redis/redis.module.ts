import { Module } from '@nestjs/common';
import { RedisModule as BaseModule, DEFAULT_REDIS_NAMESPACE } from '@songkeys/nestjs-redis';
import { RedisOptions } from 'ioredis';

import { CONFIG } from '~/config';
import { REDIS_SUBSCRIBER } from '~/decorators/redis.decorator';
import { RedisHealthIndicator } from './redis.indicator';

export const REDIS_CONFIG = {
  family: CONFIG.redisFamily,
  // tls: { rejectUnauthorized: false },  // Required for self-signed certs (i.e. Render)
  // enableReadyCheck: false, // Required due to https://github.com/OptimalBits/bull/issues/1873
  maxRetriesPerRequest: null, // ^^
} satisfies RedisOptions;

@Module({
  imports: [
    BaseModule.forRoot({
      config: [
        {
          namespace: DEFAULT_REDIS_NAMESPACE,
          url: CONFIG.redisUrl,
          connectionName: `${CONFIG.serverId}:${DEFAULT_REDIS_NAMESPACE}`,
        },
        {
          namespace: REDIS_SUBSCRIBER,
          url: CONFIG.redisUrl,
          connectionName: `${CONFIG.serverId}:${REDIS_SUBSCRIBER}`,
        },
      ],
      commonOptions: REDIS_CONFIG,
    }),
  ],
  exports: [RedisHealthIndicator],
  providers: [RedisHealthIndicator],
})
export class RedisModule {}
