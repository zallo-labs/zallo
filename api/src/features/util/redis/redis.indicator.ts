import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  async check(key: string, client: Redis) {
    try {
      await client.ping();
      return this.getStatus(key, true, { status: 'ok' });
    } catch (e) {
      throw new HealthCheckError('Redis check failed', e);
    }
  }
}
