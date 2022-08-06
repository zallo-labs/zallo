import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from 'nestjs-prisma';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.indicator';
import { RedisHealthIndicator } from './redis.indicator';

@Module({
  imports: [TerminusModule, HttpModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
