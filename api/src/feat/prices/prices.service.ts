import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Hex, UAddress, asHex, filterAsync, decodeRevertError, isUAddress, asUAddress } from 'lib';
import { Price } from './prices.model';
import e from '~/edgeql-js';
import { preferUserToken } from '~/feat/tokens/tokens.service';
import { DatabaseService } from '~/core/database/database.service';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { CONFIG } from '~/config';
import { DateTime } from 'luxon';
import { ETH, PYTH } from 'lib/dapps';
import { CHAINS, Chain } from 'chains';
import { NetworksService } from '~/core/networks/networks.service';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { runExclusively } from '~/util/mutex';
import { and } from '~/core/database/database.util';
import { PricesWatcher } from './prices.watcher';
import { PriceData, extractFeedPrice } from './prices.util';

@Injectable()
export class PricesService implements OnModuleInit {
  private log = new Logger(this.constructor.name);
  private pyth: EvmPriceServiceConnection;
  private lastOnchainPublishTime = Object.keys(CHAINS).reduce(
    (acc, chain) => ({
      ...acc,
      [chain]: new Map<Hex, DateTime>(),
    }),
    {} as Record<Chain, Map<Hex, DateTime>>,
  );
  private systemTokenPriceIds = new Map<UAddress, Hex>();

  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    @InjectRedis() private redis: Redis,
    private watcher: PricesWatcher,
  ) {
    this.pyth = new EvmPriceServiceConnection(CONFIG.pythHermesUrl);
  }

  onModuleInit() {
    this.initSystemToken();
  }

  async price(tokenOrUsdPriceId: Hex | UAddress): Promise<Price> {
    const tokenPriceId = isUAddress(tokenOrUsdPriceId)
      ? await this.getUsdPriceId(tokenOrUsdPriceId)
      : tokenOrUsdPriceId;

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
    const cached = await this.watcher.getPrice(priceId);
    if (cached) return cached;

    const [feed] = (await this.pyth.getLatestPriceFeeds([priceId])) ?? [];
    if (!feed) return null;

    return extractFeedPrice(feed);
  }

  private async getUsdPriceId(token: UAddress) {
    const cached = this.systemTokenPriceIds.get(token);
    if (cached) return cached;

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
    if (!usdPriceId) throw new Error(`Failed to get price id for ${token}`);

    return asHex(usdPriceId);
  }

  async updatePriceFeedsIfNecessary(chain: Chain, priceIds: Hex[]) {
    priceIds = [...new Set(priceIds)].sort();

    // No need to update ETH/USD if it's the only required pricefeed; all fees are priced in ETH, so ETH/USD is only used when converting from token -> ETH
    if (priceIds.length === 1 && priceIds[0] === ETH.pythUsdPriceId) return;

    if (
      priceIds
        .map((priceId) => this.isPriceFeedGuaranteedFresh(chain, priceId))
        .every((fresh) => fresh)
    )
      return;

    await runExclusively(
      async () => {
        const expiredPriceIds = await filterAsync(
          priceIds,
          async (priceId) => !(await this.checkPriceFeedFresh(chain, priceId)),
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

        const transactionHash = await network.useWallet(
          async (wallet) => await wallet.writeContract(sim.request),
        );
        await network.waitForTransactionReceipt({ hash: transactionHash });

        this.log.debug(`${chain}: updated pricefeeds ${expiredPriceIds.join(', ')}`);
      },
      {
        redis: this.redis,
        key: priceIds.map((priceId) => `prices.updatePricefeed:${chain}:${priceId}`),
      },
    );
  }

  private isPriceFeedGuaranteedFresh(chain: Chain, priceId: Hex): boolean {
    // Publish times can never go backwards, so our cache can never have false positives, but may have false negatives
    const publishTime = this.lastOnchainPublishTime[chain].get(priceId);
    return !!publishTime && publishTime > this.expiry;
  }

  async checkPriceFeedFresh(chain: Chain, priceId: Hex): Promise<boolean> {
    if (this.isPriceFeedGuaranteedFresh(chain, priceId)) return true;

    try {
      const p = await this.networks.get(chain).readContract({
        abi: PYTH.abi,
        address: PYTH.address[chain],
        functionName: 'getPriceUnsafe',
        args: [priceId],
      });

      const publishTime = DateTime.fromSeconds(Number(p.publishTime));
      this.lastOnchainPublishTime[chain].set(priceId, publishTime);

      return publishTime > this.expiry;
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

  private get expiry() {
    // Paymaster allows prices no older than *60 minutes*
    return DateTime.now().minus({ minutes: 59 });
  }

  private async initSystemToken() {
    const r = await this.db.query(
      e.select(e.Token, (t) => ({
        filter: and(t.isSystem, e.op('exists', t.pythUsdPriceId)),
        address: true,
        pythUsdPriceId: true,
      })),
    );

    this.systemTokenPriceIds = new Map(
      r.map((v) => [asUAddress(v.address), asHex(v.pythUsdPriceId!)] as const),
    );

    this.watcher.subscribe([...this.systemTokenPriceIds.values()]);
  }
}
