import { Module } from '@nestjs/common';
import { BullModule as BaseModule } from '@nestjs/bull';
import { DEFAULT_REDIS_NAMESPACE, RedisService } from '@liaoliaots/nestjs-redis';
import { REDIS_SUBSCRIBER } from '~/decorators/redis.decorator';
import { match } from 'ts-pattern';
import Redis from 'ioredis';
import { REDIS_CONFIG } from '../redis/redis.module';

@Module({
  imports: [
    BaseModule.forRootAsync({
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        createClient: (type) =>
          match(type)
            .with('subscriber', () => redisService.getClient(REDIS_SUBSCRIBER))
            .with('client', () => redisService.getClient(DEFAULT_REDIS_NAMESPACE))
            .with('bclient', () => new Redis(REDIS_CONFIG)) // Blocking client - one required each queue
            .exhaustive(),
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 18, // 2^18 * 200ms = ~14.5h
          backoff: { type: 'exponential', delay: 200 },
        },
      }),
    }),
  ],
})
export class BullModule {}
