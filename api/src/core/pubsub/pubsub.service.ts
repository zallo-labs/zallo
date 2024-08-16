import { InjectRedis } from '@songkeys/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { InjectRedisSubscriber } from '~/common/decorators/redis.decorator';
import { afterRequest } from '../context';

const DEDUP_WINDOW = 1;
const REPLAY_WINDOW = 60;

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
    const id = `subscription:published:${trigger}:${variant(payload)}`;
    const r = await this.redis.call('set', id, '1', 'NX', 'EX', DEDUP_WINDOW); // set if not exists, doesn't reset expiry
    if (r !== 'OK') return; // Event already published

    afterRequest(() => {
      this.publish<T>(trigger, payload);

      // Store the last event for replay
      this.redis.set(replayKey(trigger), JSON.stringify(payload), 'EX', REPLAY_WINDOW);
    });
  }

  asyncIterator<T>(triggers: string | string[], options?: unknown): AsyncIterator<T> {
    const iterator = super.asyncIterator<T>(triggers, options);

    this.replay(Array.isArray(triggers) ? triggers : [triggers]);

    return iterator;
  }

  private async replay<T>(triggers: string[]) {
    triggers.map(async (trigger) => {
      const lastEventJson = await this.redis.get(replayKey(trigger));
      if (lastEventJson) {
        const payload = JSON.parse(lastEventJson) as T;
        this.publish<T>(trigger, payload);
      }
    });
  }
}

function eventVariant(payload: EventPayload) {
  return `${payload.event}`;
}

function replayKey(trigger: string) {
  return `subscription:replay:${trigger}`;
}
