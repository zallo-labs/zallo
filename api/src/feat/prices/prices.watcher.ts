import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Decimal from 'decimal.js';
import Redis from 'ioredis';
import { Hex, asHex } from 'lib';
import { CONFIG } from '~/config';
import { parsePriceUpdate } from './prices.util';
import { InjectRedisSubscriber } from '~/common/decorators/redis.decorator';
import { HermesClient, PriceUpdate } from '@pythnetwork/hermes-client';

interface PriceData {
  current: Decimal;
  ema: Decimal;
}

const EXPIRE_AFTER_SECONDS = 300; // Expiry may only occurs if the price is not being watched, or pyth hermes is down
const SUBSCRIPTIONS = 'price:subscriptions';
const SUBSCRIPTIONS_CHANNEL = `__keyspace@0__:${SUBSCRIPTIONS}`;

function priceIdKey(priceId: Hex) {
  return `price:${priceId}`;
}

@Injectable()
export class PricesWatcher implements OnModuleInit, OnModuleDestroy {
  private log = new Logger(this.constructor.name);
  private pyth: HermesClient;
  private watched = new Set<Hex>();
  private eventSource?: EventSource;

  constructor(
    @InjectRedis() private redis: Redis,
    @InjectRedisSubscriber() private redisSubscriber: Redis,
  ) {
    this.pyth = new HermesClient(CONFIG.pythHermesUrl);
  }

  onModuleInit() {
    if (!CONFIG.backgroundJobs) return;

    this.watchSubscriptions();

    // Update subscriptions on changes to the SUBSCRIPTIONS set
    this.redisSubscriber.config('SET', 'notify-keyspace-events', 'AKE');
    this.redisSubscriber.psubscribe(SUBSCRIPTIONS_CHANNEL);
    this.redisSubscriber.on('pmessage', (_pattern, channel, _operation) => {
      if (channel === SUBSCRIPTIONS_CHANNEL) this.watchSubscriptions();
    });
  }

  onModuleDestroy() {
    this.eventSource?.close();
  }

  async getPrice(priceId: Hex): Promise<PriceData | undefined> {
    const c = await this.redis.hgetall(priceIdKey(priceId));
    if (!('current' in c && 'ema' in c)) {
      this.subscribe([priceId]);
      return undefined;
    }
    return { current: new Decimal(c.current), ema: new Decimal(c.ema) };
  }

  async subscribe(priceIds: Hex[]) {
    if (priceIds.length) this.redis.sadd(SUBSCRIPTIONS, ...priceIds);
  }

  private async watchSubscriptions() {
    const priceIds = (await this.redis.smembers(SUBSCRIPTIONS)).map(asHex);
    if (priceIds.every((p) => this.watched.has(p))) return;

    this.watched = new Set(priceIds);
    this.eventSource?.close();
    const eventSource = await this.pyth.getPriceUpdatesStream(priceIds, {
      parsed: true,
      benchmarksOnly: true,
    });

    eventSource.onmessage = (m: MessageEvent<string>) => {
      const updates = (JSON.parse(m.data) as PriceUpdate).parsed ?? [];
      if (!updates.length) return;

      const pipeline = this.redis.pipeline();
      for (const priceUpdate of updates) {
        const p = parsePriceUpdate(priceUpdate);

        const cacheKey = priceIdKey(asHex(`0x${priceUpdate.id}`));
        pipeline
          .hset(cacheKey, {
            current: p.current.toString(),
            ema: p.ema.toString(),
          })
          .expire(cacheKey, EXPIRE_AFTER_SECONDS);
      }
      pipeline.exec();
    };
  }
}
