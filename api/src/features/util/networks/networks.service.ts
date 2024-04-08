import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { asChain, asUAddress, UAddress } from 'lib';
import { ChainConfig, Chain, CHAINS, NetworkWallet, isChain } from 'chains';
import {
  EstimateFeesPerGasReturnType,
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
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { runExclusively } from '~/util/mutex';

export type Network = ReturnType<typeof create>;

@Injectable()
export class NetworksService implements AsyncIterable<Network> {
  private clients: Partial<Record<Chain, Network>> = {};

  constructor(@InjectRedis() private redis: Redis) {}

  get(p: Chain | ChainConfig | UAddress) {
    const chain = typeof p === 'string' ? (isChain(p) ? p : asChain(p)) : p.key;

    return (this.clients[chain] ??= create({ chainKey: chain, redis: this.redis }));
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
  const transport = http();
  // const transport = chain.rpcUrls.default.webSocket.length
  //   ? webSocket(undefined, { retryCount: 10 })
  //   : http();
  // TODO: use fallback transport when eth_subscribe works with websockets - https://github.com/wevm/viem/issues/776
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
    pollingInterval: 500 /* ms */, // Used when websocket is unavailable
  }).extend((client) => ({
    ...walletActions(client, transport, redis),
    ...blockNumberAndStatusActions(client),
    ...estimatedFeesPerGas(client, redis),
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
      return runExclusively(() => f(wallet), {
        redis,
        key: `network-wallet:${walletAddress}`,
      });
    },
  };
}

const BLOCK_TIME_ALPHA = 0.2;
const DEFAULT_BLOCK_TIME = 1000; /* ms */

function blockNumberAndStatusActions(client: Client) {
  const status = new ReplaySubject<'healthy' | WatchBlockNumberErrorType>(1);
  let blockNumber = 0n;
  let blockTime = DEFAULT_BLOCK_TIME;
  let updated = Date.now();

  const sinceLastBlock = () => Date.now() - updated;
  const getBlockTime = () =>
    Math.ceil((1 - BLOCK_TIME_ALPHA) * blockTime + BLOCK_TIME_ALPHA * sinceLastBlock());

  client.watchBlockNumber({
    onBlockNumber: (newBlockNumber) => {
      if (newBlockNumber < blockNumber) return;

      status.next('healthy');
      blockNumber = newBlockNumber;
      blockTime = getBlockTime();
      updated = Date.now();
    },
    onError: (error) => {
      status.next(error as WatchBlockNumberErrorType);
    },
    emitOnBegin: true,
    poll: true, // TODO: remove when fixed websocket watchX auto reconnect is supported - https://github.com/wevm/viem/issues/877
  });

  return {
    status() {
      return firstValueFrom(status);
    },
    blockNumber() {
      return blockNumber;
    },
    blockTime() {
      return getBlockTime();
    },
    sinceLastBlock() {
      return sinceLastBlock();
    },
  };
}

export function estimatedFeesPerGasKey(chain: Chain) {
  return `estimatedFeesPerGasKey:${chain}`;
}

function estimatedFeesPerGas(client: Client, redis: Redis) {
  return {
    estimatedFeesPerGas: async (): Promise<EstimateFeesPerGasReturnType> => {
      const key = estimatedFeesPerGasKey(client.chain.key);
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached) as EstimateFeesPerGasReturnType;

      return client.estimateFeesPerGas();
    },
  };
}
