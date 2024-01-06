import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../util/redis/redis.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule, DatabaseModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
