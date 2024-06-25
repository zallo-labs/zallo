import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '~/common/decorators/public.decorator';
import { RedisHealthIndicator } from '~/core/redis/redis.indicator';
import { DatabaseHealthIndicator } from '~/core/database/database.health';
import { NetworksHealthIndicator } from '~/core/networks/networks.health';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { InjectRedisSubscriber } from '~/common/decorators/redis.decorator';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealth: DatabaseHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private networksHealth: NetworksHealthIndicator,
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRedisSubscriber()
    private readonly redisSub: Redis,
  ) {}

  @Public()
  @Get('live')
  @HealthCheck()
  live() {
    return 'OK';
  }

  @Public()
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.dbHealth.check('Database'),
      () => this.redisHealth.check('Redis::default', this.redis),
      () => this.redisHealth.check('Redis::subscriber', this.redisSub),
      () => this.networksHealth.check('Networks'),
    ]);
  }
}
