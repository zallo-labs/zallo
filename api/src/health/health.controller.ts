import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '~/decorators/public.decorator';
import { PrismaHealthIndicator } from './prisma.indicator';
import { RedisHealthIndicator } from './redis.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('prisma'),
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }
}
