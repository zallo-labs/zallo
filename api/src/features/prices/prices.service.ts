import { Injectable } from '@nestjs/common';
import { Hex, UAddress, asHex, filterAsync, decodeRevertError, isUAddress } from 'lib';
import { Price } from './prices.model';
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

interface PriceData {
  current: Decimal;
  ema: Decimal;
}

@Injectable()
export class PricesService {
  private pyth: EvmPriceServiceConnection;
  private usdPrices = new Map<Hex, PriceData>();
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

  async price(tokenOrUsdPriceId: Hex | UAddress): Promise<Price> {
    const tokenPriceId = isUAddress(tokenOrUsdPriceId)
      ? await this.getUsdPriceId(tokenOrUsdPriceId)
      : tokenOrUsdPriceId;
    if (!tokenPriceId) throw new Error(`Failed to get price id for ${tokenOrUsdPriceId}`);

    const [ethUsd, tokenUsd] = await Promise.all([
      this.usd(ETH.pythUsdPriceId),
      this.usd(tokenPriceId),
    ]);
    if (!ethUsd || !tokenUsd) throw new Error(`Failed to get pricefeed for ${tokenPriceId}`);

    return {
      id: tokenPriceId,
      usd: tokenUsd.current,
      usdEma: tokenUsd.ema,
      eth: tokenUsd.current.div(ethUsd.current),
      ethEma: tokenUsd.ema.div(ethUsd.ema),
    };
  }

  async usd(priceId: Hex): Promise<PriceData | null> {
    const cached = this.usdPrices.get(priceId);
    if (cached) return cached;

    const [feed] = (await this.pyth.getLatestPriceFeeds([priceId])) ?? [];
    if (!feed) return null;

    return this.getPriceDataFromFeed(priceId, feed);
  }

  private async getPriceDataFromFeed(priceId: Hex, feed: PriceFeed): Promise<PriceData | null> {
    const oldestAcceptableTimestamp = Math.ceil(this.oldestAcceptablePublishTime.toSeconds());

    const currentData = feed.getPriceNoOlderThan(oldestAcceptableTimestamp);
    const emaData = feed.getEmaPriceNoOlderThan(oldestAcceptableTimestamp);
    if (!currentData || !emaData) return null;

    const current = new Decimal(currentData.price).mul(new Decimal(10).pow(currentData.expo));
    const ema = new Decimal(emaData.price).mul(new Decimal(10).pow(emaData.expo));

    const r = { current, ema };

    // Cache price and subscribe to updates to ensure cache remains fresh
    const firstTimeSet = !this.usdPrices.has(priceId);
    this.usdPrices.set(priceId, r);
    if (firstTimeSet) {
      this.pyth.subscribePriceFeedUpdates([priceId], (feed) => {
        this.getPriceDataFromFeed(priceId, feed);
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

      const updateData = (await this.pyth.getPriceFeedsUpdateData(expiredPriceIds)).map(asHex);

      const network = this.networks.get(chain);
      const updateFee = await network.readContract({
        abi: PYTH.abi,
        address: PYTH.address[chain],
        functionName: 'getUpdateFee',
        args: [updateData],
      });

      const sim = await network.simulateContract({
        abi: PYTH.abi,
        address: PYTH.address[chain],
        functionName: 'updatePriceFeeds',
        args: [updateData],
        value: updateFee,
      });

      await network.useWallet(async (wallet) => {
        await wallet.writeContract(sim.request);
      });
    } finally {
      await mutex.release();
    }
  }

  private async isOnchainPriceFeedFresh(chain: Chain, priceId: Hex): Promise<boolean> {
    const cachedPublishTime = this.lastOnchainPublishTime[chain].get(priceId);
    if (cachedPublishTime && cachedPublishTime < this.oldestAcceptablePublishTime) return false;

    try {
      const p = await this.networks.get(chain).readContract({
        abi: PYTH.abi,
        address: PYTH.address[chain],
        functionName: 'getPriceUnsafe',
        args: [priceId],
      });

      const publishTime = DateTime.fromSeconds(Number(p.price));
      this.lastOnchainPublishTime[chain].set(priceId, publishTime);

      return publishTime < this.oldestAcceptablePublishTime;
    } catch (error) {
      const e = decodeRevertError({ error, abi: PYTH.abi });
      if (e?.errorName === 'PriceFeedNotFound') {
        // PriceFeedNotFound also occurs if it is not pushed on-chain yet
        this.lastOnchainPublishTime[chain].set(priceId, DateTime.fromSeconds(0));
        return false;
      }
      throw error;
    }
  }

  private handlePythError(error: Error) {
    console.error(error);
  }

  private get oldestAcceptablePublishTime() {
    // Paymaster allows prices no older than *60 minutes*
    return DateTime.now().minus({ minutes: 55 });
  }
}
