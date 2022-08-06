import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string) {
    try {
      await this.redis.ping();
      return this.getStatus(key, true, { status: 'up' });
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', e);
    }
  }
}
