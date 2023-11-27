import { Injectable } from '@nestjs/common';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/config';
import { Address, tryOrIgnoreAsync, asChain, asUAddress, UAddress, asAddress } from 'lib';
import { ChainConfig, Chain, CHAINS, NetworkWallet } from 'chains';
import { ERC20 } from 'lib/dapps';
import { createPublicClient, createWalletClient, fallback, http, webSocket } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
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

  // Ethers (deprecated)
  const provider = new zk.Provider(
    chain.rpcUrls.default.webSocket[0] ?? chain.rpcUrls.default.http[0],
    { chainId: chain.id, name: chain.name },
  );

  return createPublicClient({
    chain,
    transport: fallback([
      ...chain.rpcUrls.default.webSocket.map((url) => webSocket(url, { retryCount: 10 })),
      ...chain.rpcUrls.default.http.map((url) => http(url, { retryCount: 10, batch: true })),
    ]),
    key: chain.key,
    name: chain.name,
    batch: { multicall: true },
  }).extend((client) => ({
    provider,
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
    async balance(args: BalanceArgs) {
      const key = getBalanceKey(args);
      const cached = await redis.get(key);
      if (cached) return BigInt(cached);

      const { account, token } = args;
      const balance = await tryOrIgnoreAsync(async () => {
        if (token === ETH_ADDRESS) return await client.getBalance({ address: asAddress(account) });

        return await client.readContract({
          abi: ERC20,
          address: token,
          functionName: 'balanceOf',
          args: [asAddress(account)],
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
  account: UAddress;
  token: Address;
}

function getBalanceKey(args: BalanceArgs) {
  return `balance:${args.account}:${args.token}`;
}
