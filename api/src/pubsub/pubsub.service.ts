import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

@Injectable()
export class PubsubService extends RedisPubSub {
  constructor(@InjectRedis() redis: Redis) {
    super({
      publisher: redis,
      subscriber: redis,
    });
  }
}
