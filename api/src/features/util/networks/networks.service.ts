import { Injectable } from '@nestjs/common';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/config';
import {
  Address,
  ChainConfig,
  getEthersConnectionParams,
  ERC20_ABI,
  tryOrIgnoreAsync,
  Chain,
  CHAINS,
  asChain,
  asUAddress,
  UAddress,
  asLocalAddress,
} from 'lib';
import { createPublicClient, fallback, http, webSocket } from 'viem';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Mutex } from 'redis-semaphore';

export type Network = ReturnType<typeof createClient>;

@Injectable()
export class NetworksService implements AsyncIterable<Network> {
  private clients: Partial<Record<Chain, Network>>;

  constructor(@InjectRedis() private redis: Redis) {}

  get(chain: Chain | ChainConfig) {
    const key = typeof chain === 'string' ? chain : chain.key;

    return (this.clients[key] ??= createClient({ chainKey: key, redis: this.redis }));
  }

  for(address: string) {
    return this.get(asChain(asUAddress(address)));
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

function createClient({ chainKey, redis }: CreateParams) {
  const chain = CHAINS[chainKey];

  const provider = new zk.Provider(...getEthersConnectionParams(chain, 'ws'));
  const privateKey = CONFIG.walletPrivateKeys[chainKey];
  if (!privateKey) throw new Error(`Private key not found for chain: ${chainKey}`);
  const wallet = new zk.Wallet(privateKey, provider);
  const walletAddress = asUAddress(wallet.address, chain);

  return createPublicClient({
    chain,
    transport: fallback([
      ...chain.rpcUrls.default.webSocket.map((url) => webSocket(url, { retryCount: 10 })),
      ...chain.rpcUrls.default.http.map((url) => http(url, { retryCount: 10, batch: true })),
    ]),
    batch: { multicall: true },
    key: chain.key,
    name: chain.name,
  }).extend((client) => ({
    provider,
    walletAddress,
    async useWallet<R>(f: (wallet: zk.Wallet) => R): Promise<R> {
      const mutex = new Mutex(redis, `provider-wallet:${walletAddress}`, {
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
    async balance(args: BalanceArgs) {
      const key = getBalanceKey(args);
      const cached = await redis.get(key);
      if (cached) return BigInt(cached);

      const { account, token } = args;
      const balance = await tryOrIgnoreAsync(async () => {
        if (token === ETH_ADDRESS)
          return await client.getBalance({ address: asLocalAddress(account) });

        return await client.readContract({
          abi: ERC20_ABI,
          address: asLocalAddress(token),
          functionName: 'balanceOf',
          args: [asLocalAddress(account)],
        });
      });

      // Balance must be expired due to rebalancing tokens
      if (balance !== undefined) redis.set(key, balance.toString(), 'EX', 3600 /* 1 hour */);

      return balance ?? 0n;
    },
    invalidateBalance(args: BalanceArgs) {
      return redis.del(getBalanceKey(args));
    },
  }));
}

interface BalanceArgs {
  account: Address | UAddress;
  token: Address | UAddress;
}

function getBalanceKey(args: BalanceArgs) {
  return `balance:${args.account}:${args.token}`;
}
