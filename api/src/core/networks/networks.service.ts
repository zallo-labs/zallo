import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { Address, asChain, asDecimal, asUAddress, Hex, UAddress } from 'lib';
import { ChainConfig, Chain, CHAINS, NetworkWallet, isChain } from 'chains';
import {
  FeeValuesEIP1559,
  PublicClient,
  SendRawTransactionErrorType,
  Transport,
  WatchBlockNumberErrorType,
  createPublicClient,
  createWalletClient,
  fallback,
  http,
  webSocket,
  nonceManager,
} from 'viem';
import {
  eip712WalletActions,
  ZkSyncTransactionSerializableEIP712,
  publicActionsL2,
} from 'viem/zksync';
import { privateKeyToAccount } from 'viem/accounts';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { runExclusively } from '~/util/mutex';
import { ETH } from 'lib/dapps';
import { fromPromise } from 'neverthrow';
import { PartialK } from '~/util/types';

export type Network = ReturnType<typeof create>;

@Injectable()
export class NetworksService implements AsyncIterable<Network> {
  private clients: Partial<Record<Chain, Network>> = {};

  constructor(@InjectRedis() private redis: Redis) {}

  get(p: Chain | ChainConfig | UAddress): Network {
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

  const rpcUrls = CONFIG.rpcUrls[chainKey] ?? [
    ...chain.rpcUrls.default.http,
    ...chain.rpcUrls.default.webSocket,
  ];
  const transport = fallback(
    [
      ...rpcUrls.filter((url) => url.startsWith('http')).map((url) => http(url)),
      ...rpcUrls.filter((url) => url.startsWith('ws')).map((url) => webSocket(url)),
    ],
    { retryCount: 3, rank: { interval: 30_000, sampleCount: 20 } },
  );

  return createPublicClient<Transport, ChainConfig>({
    chain,
    transport,
    key: chain.key,
    name: chain.name,
    batch: { multicall: true },
    pollingInterval: 1000 /* ms */, // Used when websocket is unavailable
  }).extend((client) => ({
    ...publicActionsL2()(client),
    ...eip712WalletActions()(client),
    ...walletActions(client, transport, redis),
    ...blockDetails(client),
    ...estimatedFeesPerGas(client, redis),
    sendAccountTransaction: sendAccountTransaction(client, redis),
  }));
}

type Client = PublicClient<Transport, ChainConfig>;

function walletActions(client: Client, transport: Transport, redis: Redis) {
  const chain = client.chain;
  const wallet = createWalletClient({
    account: privateKeyToAccount(CONFIG.walletPrivateKeys[chain.key], { nonceManager }),
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

function blockDetails(client: Client) {
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
  });

  return {
    status() {
      return firstValueFrom(status);
    },
    async blockNumber() {
      await firstValueFrom(status); // Wait for initialization
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

async function getEstimatedFeesPerGas(client: Client, redis: Redis): Promise<FeeValuesEIP1559> {
  const cached = await redis.get(estimatedFeesPerGasKey(client.chain.key));
  if (cached) {
    const p = JSON.parse(cached) as any;
    return {
      maxFeePerGas: BigInt(p.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(p.maxPriorityFeePerGas),
    } satisfies FeeValuesEIP1559;
  }

  const r = await client.estimateFeesPerGas();
  if (r.maxFeePerGas === undefined || r.maxPriorityFeePerGas === undefined)
    throw new Error('Gas price estimates non EIP-1559');

  return r;
}

function estimatedFeesPerGas(client: Client, redis: Redis) {
  const estimatedFeesPerGas = async () => {
    const v = await getEstimatedFeesPerGas(client, redis);

    return {
      maxFeePerGas: asDecimal(v.maxFeePerGas!, ETH),
      maxPriorityFeePerGas: asDecimal(v.maxPriorityFeePerGas!, ETH),
    };
  };

  return {
    estimatedFeesPerGas,
    estimatedMaxFeePerGas: async () => (await estimatedFeesPerGas()).maxFeePerGas,
  };
}

export type TransactionWithDetailedOutput = {
  transactionHash: Hex;
  storageLogs: Array<{
    address: Address;
    key: string;
    writtenValue: string;
  }>;
  events: Array<{
    address: Address;
    topics: Hex[];
    data: Hex;
    blockHash: Hex | null;
    blockNumber: bigint | null;
    l1BatchNumber: bigint | null;
    transactionHash: Hex;
    transactionIndex: bigint;
    logIndex: bigint | null;
    transactionLogIndex: bigint | null;
    logType: string | null;
    removed: boolean;
  }>;
};

export type SendAccountTransactionParams = PartialK<ZkSyncTransactionSerializableEIP712, 'chainId'>;
export type SendAccountTransactionReturn = ReturnType<ReturnType<typeof sendAccountTransaction>>;

function sendAccountTransaction(client: Client, redis: Redis) {
  // Transactions must be submitted sequentially due to requirement for incrementing nonces
  return async (tx: SendAccountTransactionParams) => {
    const feesPerGas = await getEstimatedFeesPerGas(client, redis);

    return await runExclusively(
      async () => {
        const serialized = client.chain.serializers.transaction({
          chainId: client.chain.id,
          maxFeePerGas: feesPerGas.maxFeePerGas!,
          maxPriorityFeePerGas: feesPerGas.maxPriorityFeePerGas!,
          nonce: await client.getTransactionCount({ address: tx.from }),
          ...tx,
        });

        return fromPromise(
          client.request({
            method: 'zks_sendRawTransactionWithDetailedOutput' as any,
            params: [serialized],
          }) as Promise<TransactionWithDetailedOutput>,
          (e) => e as SendRawTransactionErrorType,
        );
      },
      { redis, key: `send-transaction:${asUAddress(tx.from, client.chain.key)}` },
    );
  };
}
