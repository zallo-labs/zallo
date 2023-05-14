import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import Redis from 'ioredis';
import { InjectRedisPub, InjectRedisSub } from '~/decorators/redis.decorator';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRedisPub() private readonly redisPub: Redis,
    @InjectRedisSub() private readonly redisSub: Redis,
  ) {
    super();
  }

  async check(key: string) {
    try {
      await Promise.all([this.redis.ping(), this.redisPub.ping(), this.redisSub.ping()]);
      return this.getStatus(key, true, { status: 'ok' });
    } catch (e) {
      throw new HealthCheckError('Redis check failed', e);
    }
  }
}
