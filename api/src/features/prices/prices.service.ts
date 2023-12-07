import { Injectable } from '@nestjs/common';
import { Hex, UAddress, asHex, filterAsync, isUAddress } from 'lib';
import { Price, Pricefeed } from './prices.model';
import e from '~/edgeql-js';
import { preferUserToken } from '~/features/tokens/tokens.service';
import { DatabaseService } from '~/features/database/database.service';
import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import { CONFIG } from '~/config';
import { DateTime } from 'luxon';
import { ETH, PYTH } from 'lib/dapps';
import { CHAINS, Chain } from 'chains';
import Decimal from 'decimal.js';
import { NetworksService } from '~/features/util/networks/networks.service';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Mutex } from 'redis-semaphore';

@Injectable()
export class PricesService {
  private pyth: EvmPriceServiceConnection;
  private usdPrices = new Map<Hex, Price>();
  private lastOnchainPublishTime = Object.keys(CHAINS).reduce(
    (acc, chain) => ({
      ...acc,
      [chain]: new Map<Hex, DateTime>(),
    }),
    {} as Record<Chain, Map<Hex, DateTime>>,
  );

  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    @InjectRedis() private redis: Redis,
  ) {
    this.pyth = new EvmPriceServiceConnection(CONFIG.pythHermesUrl);
    this.pyth.onWsError = this.handlePythError;
  }

  async feed(tokenOrUsdPriceId: Hex | UAddress): Promise<Pricefeed | null> {
    const [ethUsd, tokenUsd] = await Promise.all([
      this.usd(ETH.pythUsdPriceId),
      this.usd(tokenOrUsdPriceId),
    ]);
    if (!ethUsd || !tokenUsd) return null;

    return {
      id: `PriceFeed:${tokenUsd.id}`,
      usd: tokenUsd,
      eth: {
        id: `EthPrice:${tokenUsd.id}`,
        current: tokenUsd.current.div(ethUsd.current),
        ema: tokenUsd.ema.div(ethUsd.ema),
      },
    };
  }

  async usd(tokenOrUsdPriceId: Hex | UAddress): Promise<Price | null> {
    const priceId = isUAddress(tokenOrUsdPriceId)
      ? await this.getUsdPriceId(tokenOrUsdPriceId)
      : tokenOrUsdPriceId;
    if (!priceId) return null;

    const cached = this.usdPrices.get(priceId);
    if (cached) return cached;

    const [feed] = (await this.pyth.getLatestPriceFeeds([priceId])) ?? [];
    if (!feed) return null;
    return this.getPriceFromFeed(priceId, feed);
  }

  private async getPriceFromFeed(priceId: Hex, feed: PriceFeed): Promise<Price | null> {
    const oldestAcceptableTimestamp = Math.ceil(this.oldestAcceptablePublishTime.toSeconds());

    const currentData = feed.getPriceNoOlderThan(oldestAcceptableTimestamp);
    const emaData = feed.getEmaPriceNoOlderThan(oldestAcceptableTimestamp);
    if (!currentData || !emaData) return null;

    const current = new Decimal(currentData.price).mul(new Decimal(10).pow(currentData.expo));
    const ema = new Decimal(emaData.price).mul(new Decimal(10).pow(emaData.expo));

    const r: Price = { id: feed.id, current, ema };

    // Cache price and subscribe to updates to ensure cache remains fresh
    const firstTimeSet = !this.usdPrices.has(priceId);
    this.usdPrices.set(priceId, r);
    if (firstTimeSet) {
      this.pyth.subscribePriceFeedUpdates([priceId], (feed) => {
        this.getPriceFromFeed(priceId, feed);
        console.log(feed.getVAA());
      });
    }

    return r;
  }

  async getUsdPriceId(token: UAddress) {
    const usdPriceId = await this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: e.op(t.address, '=', token),
          limit: 1,
          order_by: preferUserToken(t),
          pythUsdPriceId: true,
        })).pythUsdPriceId,
      ),
    );

    return asHex(usdPriceId);
  }

  async updateOnchainPriceFeedsIfNecessary(chain: Chain, priceIds: Hex[]) {
    const mutex = new Mutex(
      this.redis,
      `${this.updateOnchainPriceFeedsIfNecessary.name}:${chain}`,
      {
        lockTimeout: 60_000,
        acquireTimeout: 60_000,
      },
    );

    await mutex.acquire();
    try {
      const expiredPriceIds = await filterAsync(
        priceIds,
        async (priceId) => !(await this.isOnchainPriceFeedFresh(chain, priceId)),
      );
      if (expiredPriceIds.length === 0) return;

      const updateData = (await this.pyth.getPriceFeedsUpdateData(expiredPriceIds)).map((base64) =>
        asHex('0x' + Buffer.from(base64, 'base64').toString('hex')),
      );

      const network = this.networks.get(chain);
      const updateFee = await network.readContract({
        abi: PYTH.abi,
        address: PYTH.address[chain],
        functionName: 'getUpdateFee',
        args: [updateData],
      });

      await network.useWallet(async (wallet) => {
        wallet.writeContract({
          abi: PYTH.abi,
          address: PYTH.address[chain],
          functionName: 'updatePriceFeeds',
          args: [updateData],
          value: updateFee,
        });
      });
    } finally {
      await mutex.release();
    }
  }

  private async isOnchainPriceFeedFresh(chain: Chain, priceId: Hex): Promise<boolean> {
    const cachedPublishTime = this.lastOnchainPublishTime[chain].get(priceId);
    if (cachedPublishTime && cachedPublishTime < this.oldestAcceptablePublishTime) return false;

    const p = await this.networks.get(chain).readContract({
      abi: PYTH.abi,
      address: PYTH.address[chain],
      functionName: 'getPrice',
      args: [priceId],
    });
    const publishTime = DateTime.fromSeconds(Number(p.price));
    this.lastOnchainPublishTime[chain].set(priceId, publishTime);

    return publishTime < this.oldestAcceptablePublishTime;
  }

  private handlePythError(error: Error) {
    console.error(error);
  }

  private get oldestAcceptablePublishTime() {
    // Paymaster allows prices no older than *60 minutes*
    return DateTime.now().minus({ minutes: 55 });
  }
}
