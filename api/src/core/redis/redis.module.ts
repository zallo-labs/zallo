import { Module } from '@nestjs/common';
import { CONFIG } from '~/config';
import { RedisModule as BaseModule, DEFAULT_REDIS_NAMESPACE } from '@songkeys/nestjs-redis';
import { REDIS_SUBSCRIBER } from '~/common/decorators/redis.decorator';
import { RedisHealthIndicator } from './redis.indicator';
import { parseRedisUrl } from 'parse-redis-url-simple';

export const REDIS_CONFIG = {
  family: CONFIG.redisFamily,
  ...parseRedisUrl(CONFIG.redisUrl)[0],
};

@Module({
  imports: [
    BaseModule.forRoot({
      config: [
        {
          ...REDIS_CONFIG,
          namespace: DEFAULT_REDIS_NAMESPACE,
          connectionName: `${CONFIG.serverId}:${DEFAULT_REDIS_NAMESPACE}`,
        },
        {
          ...REDIS_CONFIG,
          namespace: REDIS_SUBSCRIBER,
          url: CONFIG.redisUrl,
          connectionName: `${CONFIG.serverId}:${REDIS_SUBSCRIBER}`,
        },
      ],
    }),
  ],
  exports: [RedisHealthIndicator],
  providers: [RedisHealthIndicator],
})
export class RedisModule {}
