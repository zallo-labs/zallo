import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import Redis from 'ioredis';
import { InjectRedisPub, InjectRedisSub } from '~/decorators/redis.decorator';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @InjectRedisPub() private readonly redisPub: Redis,
    @InjectRedisSub() private readonly redisSub: Redis,
  ) {
    super();
  }

  async isHealthy(key: string) {
    try {
      await Promise.all([this.redisPub.ping(), this.redisSub.ping()]);
      return this.getStatus(key, true, { status: 'up' });
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', e);
    }
  }
}
