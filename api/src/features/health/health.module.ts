import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../util/redis/redis.module';

@Module({
  imports: [TerminusModule, HttpModule, DatabaseModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
