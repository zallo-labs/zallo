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
  toHex,
  hexToBigInt,
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
import Decimal from 'decimal.js';

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
    feeParams: feeParams(client, redis),
    maxFeePerGas: maxFeePerGas(client, redis),
    sendAccountTransaction: sendAccountTransaction(client, redis),
    traceCall: traceCall(client),
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

export interface NetworkFeeParams {
  maxFeePerGas: Decimal;
  maxPriorityFeePerGas: Decimal;
  gasPerPubdataLimit: bigint;
}

function feeParams(client: Client, redis: Redis) {
  const { estimateFee } = publicActionsL2()(client);

  return async (): Promise<NetworkFeeParams> => {
    const r = await (async () => {
      const key = `feeParams:${client.chain.key}`;
      const cached = await redis.get(key);
      if (cached) {
        const p = JSON.parse(cached) as any;
        return {
          maxFeePerGas: BigInt(p.maxFeePerGas),
          maxPriorityFeePerGas: BigInt(p.maxPriorityFeePerGas),
          gasPerPubdataLimit: p.gasPerPubdataLimit,
        };
      }

      const fresh = await estimateFee({
        /* estimateFee required to get gasPerPubdataLimit */
        account: '0x1111111111111111111111111111111111111111',
        to: '0x1111111111111111111111111111111111111111',
      });
      redis.set(key, JSON.stringify(fresh), 'EX', 5);
      return fresh;
    })();

    return {
      maxFeePerGas: asDecimal(r.maxFeePerGas, ETH),
      maxPriorityFeePerGas: asDecimal(r.maxPriorityFeePerGas, ETH),
      gasPerPubdataLimit: r.gasPerPubdataLimit,
    };
  };
}

function maxFeePerGas(client: Client, redis: Redis) {
  const getFeeParams = feeParams(client, redis);
  return async () => (await getFeeParams()).maxFeePerGas;
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
    return await runExclusively(
      async () => {
        const serialized = client.chain.serializers.transaction({
          chainId: client.chain.id,
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

type TraceCallSchema = {
  Parameters: [
    request: {
      from?: Address;
      to: Address;
      data: Hex;
      value: Hex;
      gas?: Hex;
      gas_price?: Hex;
      max_fee_per_gas?: Hex;
      max_priority_fee_per_gas?: Hex;
    },
    block?: Hex | 'latest', // block number or hash
    options?: TraceCallOptions,
  ];
  ReturnType: TraceCallRawResponse;
};

interface TraceCallOptions {
  tracer: 'callTracer';
  tracerConfig?: {
    onlyTopCall?: boolean;
  };
}

interface TraceCallRawResponse {
  type: 'Call' | 'Create';
  from: Address;
  to?: Address; // undefined for type = 'Create'
  value: Hex;
  input: Hex; // Call data
  output: Hex; // 0x for ops that don't return data or failed
  gas: Hex;
  gasUsed: Hex;
  error?: string | null;
  revertReason?: string | null;
  calls: TraceCallRawResponse[];
}

export interface TraceCallResponse extends Omit<TraceCallRawResponse, 'gas'> {
  gas: bigint;
}

export interface TraceCallParams {
  request: Omit<TraceCallSchema['Parameters'][0], 'value'> & { value?: bigint };
  block?: TraceCallSchema['Parameters'][1];
  options?: TraceCallSchema['Parameters'][2];
}
export type TraceCallReturnType = Awaited<ReturnType<ReturnType<typeof traceCall>>>;

function traceCall(client: Client) {
  return async (params: TraceCallParams) => {
    const request = {
      ...params.request,
      value: params.request.value ? toHex(params.request.value) : '0x0',
    };

    const options =
      params.options ??
      ({
        tracer: 'callTracer',
        tracerConfig: {
          onlyTopCall: true,
        },
      } satisfies TraceCallOptions);

    const r = await client.request<TraceCallSchema>({
      method: 'debug_traceCall',
      params: [request, params.block ?? 'latest', options],
    });

    return {
      ...r,
      gasUsed: hexToBigInt(r.gasUsed),
    };
  };
}
