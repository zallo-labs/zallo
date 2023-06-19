import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { InjectRedisSubscriber } from '~/decorators/redis.decorator';

@Injectable()
export class PubsubService extends RedisPubSub {
  constructor(@InjectRedis() redis: Redis, @InjectRedisSubscriber() redisSub: Redis) {
    super({
      publisher: redis,
      subscriber: redisSub,
    });
  }
}
