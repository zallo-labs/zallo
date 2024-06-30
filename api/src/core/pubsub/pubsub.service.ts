import { InjectRedis } from '@songkeys/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { InjectRedisSubscriber } from '~/common/decorators/redis.decorator';
import { afterRequest } from '../context';

const WINDOW_S = 1;

export interface EventPayload<E = unknown> {
  event: E;
}

@Injectable()
export class PubsubService extends RedisPubSub {
  constructor(
    @InjectRedis() private redis: Redis,
    @InjectRedisSubscriber() redisSub: Redis,
  ) {
    super({ publisher: redis, subscriber: redisSub });
  }

  async event<T extends EventPayload>(
    trigger: string,
    payload: T,
    variant: (payload: T) => string = eventVariant,
  ) {
    // Dedublicate events within a window of time
    const id = `published:${trigger}:${variant(payload)}`;
    const r = await this.redis.call('set', id, '1', 'NX', 'EX', WINDOW_S); // set if not exists, doesn't reset expiry
    if (r !== 'OK') return; // Event already published

    afterRequest(() => {
      this.publish<T>(trigger, payload);
    });
  }
}

function eventVariant(payload: EventPayload) {
  return `${payload.event}`;
}
