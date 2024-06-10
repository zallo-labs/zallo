import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Decimal from 'decimal.js';
import Redis from 'ioredis';
import { Hex, asHex } from 'lib';
import { CONFIG } from '~/config';
import { extractFeedPrice } from './prices.util';
import { InjectRedisSubscriber } from '~/decorators/redis.decorator';

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
  private pyth: EvmPriceServiceConnection;
  private watched = new Set<Hex>();

  constructor(
    @InjectRedis() private redis: Redis,
    @InjectRedisSubscriber() private redisSubscriber: Redis,
  ) {
    this.pyth = this.newConnection();
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
    this.pyth.closeWebSocket;
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
    this.redis.sadd(SUBSCRIPTIONS, ...priceIds);
  }

  private async watchSubscriptions() {
    const priceIds = (await this.redis.smembers(SUBSCRIPTIONS))
      .map(asHex)
      .filter((p) => !this.watched.has(p));
    if (!priceIds.length) return;

    for (const priceId of priceIds) {
      this.watched.add(priceId);
      const cacheKey = priceIdKey(priceId);

      this.pyth.subscribePriceFeedUpdates([priceId], (feed) => {
        const p = extractFeedPrice(feed);

        this.redis
          .multi()
          .hset(cacheKey, {
            current: p.current.toString(),
            ema: p.ema.toString(),
          })
          .expire(cacheKey, EXPIRE_AFTER_SECONDS)
          .exec();
      });
    }
  }

  private newConnection() {
    const pyth = new EvmPriceServiceConnection(CONFIG.pythHermesUrl);
    pyth.onWsError = (e) => this.handleWebsocketError(e);
    return pyth;
  }

  private handleWebsocketError(error: Error) {
    this.log.error(error);
    // this.pyth.closeWebSocket();
    // this.watched.clear();

    // this.pyth = this.newConnection();
    // this.watchSubscriptions();
  }
}
