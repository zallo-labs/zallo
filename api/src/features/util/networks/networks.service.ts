import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { asChain, asUAddress, UAddress } from 'lib';
import { ChainConfig, Chain, CHAINS, NetworkWallet } from 'chains';
import {
  FallbackTransport,
  createPublicClient,
  createWalletClient,
  fallback,
  http,
  webSocket,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Mutex } from 'redis-semaphore';

export type Network = ReturnType<typeof create>;

@Injectable()
export class NetworksService implements AsyncIterable<Network> {
  private clients: Partial<Record<Chain, Network>> = {};

  constructor(@InjectRedis() private redis: Redis) {}

  get(chain: Chain | ChainConfig) {
    const key = typeof chain === 'string' ? chain : chain.key;

    return (this.clients[key] ??= create({ chainKey: key, redis: this.redis }));
  }

  for(address: UAddress) {
    return this.get(asChain(address));
  }

  async *[Symbol.asyncIterator]() {
    for (const chain of Object.values(CHAINS)) {
      try {
        const existing = this.clients[chain.key];
        if (existing) return existing;

        const network = this.get(chain);
        await network.getBlockNumber();
        yield network;
      } catch (_) {
        // Ignore unavailable networks e.g. local
      }
    }
  }
}

interface CreateParams {
  chainKey: Chain;
  redis: Redis;
}

function create({ chainKey, redis }: CreateParams) {
  const chain = CHAINS[chainKey];
  const transport = fallback([
    ...chain.rpcUrls.default.webSocket.map((url) => webSocket(url, { retryCount: 10 })),
    ...chain.rpcUrls.default.http.map((url) => http(url, { retryCount: 10, batch: true })),
  ]);

  const wallet = createWalletClient({
    account: privateKeyToAccount(CONFIG.walletPrivateKeys[chainKey]),
    chain,
    transport,
  });
  const walletAddress = asUAddress(wallet.account.address, chainKey);

  return createPublicClient<FallbackTransport, ChainConfig>({
    chain,
    transport: fallback([
      ...chain.rpcUrls.default.webSocket.map((url) => webSocket(url, { retryCount: 10 })),
      ...chain.rpcUrls.default.http.map((url) => http(url, { retryCount: 10, batch: true })),
    ]),
    key: chain.key,
    name: chain.name,
    batch: { multicall: true },
    pollingInterval: 250 /* ms */,
  }).extend((_client) => ({
    walletAddress,
    async useWallet<R>(f: (wallet: NetworkWallet) => R): Promise<R> {
      const mutex = new Mutex(redis, `network-wallet:${walletAddress}`, {
        lockTimeout: 60_000,
        acquireTimeout: 60_000,
      });

      try {
        await mutex.acquire();
        return await f(wallet);
      } finally {
        await mutex.release();
      }
    },
  }));
}
