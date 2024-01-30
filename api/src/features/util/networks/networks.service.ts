import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { asChain, asUAddress, UAddress } from 'lib';
import { ChainConfig, Chain, CHAINS, NetworkWallet, isChain } from 'chains';
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
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { runExclusively } from '~/util/mutex';
import { DateTime } from 'luxon';

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
  const transport = chain.rpcUrls.default.webSocket.length
    ? webSocket(undefined, { retryCount: 10 })
    : http();
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
  let updated = DateTime.now();

  client.watchBlockNumber({
    onBlockNumber: (newBlockNumber) => {
      if (newBlockNumber < blockNumber) return;

      status.next('healthy');
      blockNumber = newBlockNumber;

      // blockTime
      const t = DateTime.now();
      const diff = t.diff(updated).toMillis();
      blockTime = Math.ceil((1 - BLOCK_TIME_ALPHA) * blockTime + BLOCK_TIME_ALPHA * diff);
      updated = t;
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
      return blockTime;
    },
  };
}
