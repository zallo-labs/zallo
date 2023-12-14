import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { asChain, asUAddress, UAddress } from 'lib';
import { ChainConfig, Chain, CHAINS, NetworkWallet } from 'chains';
import {
  PublicClient,
  Transport,
  WatchBlockNumberErrorType,
  createPublicClient,
  createWalletClient,
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

  *all() {
    for (const chain of Object.values(CHAINS)) {
      yield this.get(chain);
    }
  }

  async *[Symbol.asyncIterator]() {
    for (const network of this.all()) {
      if ((await network.status()) === 'healthy') yield network;
    }
  }
}

interface CreateParams {
  chainKey: Chain;
  redis: Redis;
}

function create({ chainKey, redis }: CreateParams) {
  const chain = CHAINS[chainKey];
  const transport = chain.rpcUrls.default.webSocket.length
    ? webSocket(undefined, { retryCount: 10 })
    : http();
  // const transport = fallback([
  //   ...chain.rpcUrls.default.webSocket.map((url) => webSocket(url, { retryCount: 10 })),
  //   ...chain.rpcUrls.default.http.map((url) => http(url, { retryCount: 10, batch: true })),
  // ]);

  return createPublicClient<Transport, ChainConfig>({
    chain,
    transport,
    key: chain.key,
    name: chain.name,
    batch: { multicall: true },
    pollingInterval: 250 /* ms */, // Used when websocket is unavailable
  }).extend((client) => ({
    ...walletActions(client, transport, redis),
    ...blockNumberAndStatusActions(client),
  }));
}

type Client = PublicClient<Transport, ChainConfig>;

function walletActions(client: Client, transport: Transport, redis: Redis) {
  const chain = client.chain;
  const wallet = createWalletClient({
    account: privateKeyToAccount(CONFIG.walletPrivateKeys[chain.key]),
    chain,
    transport,
  });
  const walletAddress = asUAddress(wallet.account.address, chain.key);

  return {
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
  };
}

function blockNumberAndStatusActions(client: Client) {
  let status: 'healthy' | WatchBlockNumberErrorType = 'healthy';
  let blockNumber = 0n;

  let connect: (() => void) | null = null;
  const connecting = new Promise<void>((resolve) => {
    connect = () => {
      resolve();
      connect = null;
    };
  });

  client.watchBlockNumber({
    onBlockNumber: (newBlockNumber) => {
      if (blockNumber < newBlockNumber) {
        blockNumber = newBlockNumber;
        status = 'healthy';
        connect?.();
      }
    },
    onError: (error) => {
      status = error as WatchBlockNumberErrorType;
    },
    emitOnBegin: true,
  });

  return {
    blockNumber() {
      return blockNumber;
    },
    async status() {
      await connecting;
      return status;
    },
  };
}
