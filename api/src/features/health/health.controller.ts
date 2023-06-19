import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '~/decorators/public.decorator';
import { RedisHealthIndicator } from '../util/redis/redis.indicator';
import { DatabaseHealthIndicator } from '../database/database.health';
import { ProviderHealthIndicator } from '../util/provider/provider.health';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { InjectRedisSubscriber } from '~/decorators/redis.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealth: DatabaseHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private providerHealth: ProviderHealthIndicator,
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRedisSubscriber()
    private readonly redisSub: Redis,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dbHealth.check('Database'),
      () => this.redisHealth.check('Redis::default', this.redis),
      () => this.redisHealth.check('Redis::subscriber', this.redisSub),
      () => this.providerHealth.check('Provider'),
    ]);
  }
}
