import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { InjectRedisPub, InjectRedisSub } from '~/decorators/redis.decorator';

@Injectable()
export class PubsubService extends RedisPubSub {
  constructor(@InjectRedisPub() redisPub: Redis, @InjectRedisSub() redisSub: Redis) {
    super({
      publisher: redisPub,
      subscriber: redisSub,
    });
  }
}
