import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '~/decorators/public.decorator';
import { RedisHealthIndicator } from '../util/redis/redis.indicator';
import { DatabaseHealthIndicator } from '../database/database.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealth: DatabaseHealthIndicator,
    private redisHealth: RedisHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dbHealth.check('Database'),
      () => this.redisHealth.check('Redis'),
    ]);
  }
}
