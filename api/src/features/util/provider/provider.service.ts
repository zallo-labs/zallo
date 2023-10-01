import { Injectable } from '@nestjs/common';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/config';
import {
  Address,
  Account,
  Factory,
  Factory__factory,
  Chain,
  Account__factory,
  Addresslike,
  asAddress,
  VerifySignatureOptions,
  asApproval,
  DeployArgs,
  getProxyAddress,
  deployAccountProxy,
  getEthersConnectionParams,
  ERC20_ABI,
  tryOrIgnoreAsync,
} from 'lib';
import { PublicClient, WebSocketTransport, createPublicClient, webSocket } from 'viem';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Mutex } from 'redis-semaphore';

interface BalanceArgs {
  account: Address;
  token: Address;
}

const getBalanceKey = (args: BalanceArgs) => `balance:${args.account}:${args.token}`;

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;
  public client: PublicClient<WebSocketTransport, typeof CONFIG.chain>;
  private wallet: zk.Wallet;
  private proxyFactory: Factory;

  constructor(@InjectRedis() private redis: Redis) {
    super(...getEthersConnectionParams(CONFIG.chain, 'http'));
    this.chain = CONFIG.chain;

    this.client = createPublicClient({
      transport: webSocket(undefined, { retryCount: 10 }),
      chain: CONFIG.chain,
      batch: { multicall: true },
    });

    this.wallet = (
      this.chain.testnet && CONFIG.walletPrivateKey
        ? new zk.Wallet(CONFIG.walletPrivateKey)
        : zk.Wallet.createRandom()
    ).connect(this);

    this.proxyFactory = Factory__factory.connect(CONFIG.proxyFactoryAddress, this.wallet);
  }

  get walletAddress(): Address {
    return this.wallet.address;
  }

  async useWallet<R>(f: (wallet: zk.Wallet) => R): Promise<R> {
    const mutex = new Mutex(this.redis, `provider-wallet:${this.wallet.address}`, {
      lockTimeout: 60_000,
      acquireTimeout: 60_000,
    });

    try {
      await mutex.acquire();
      return await f(this.wallet);
    } finally {
      await mutex.release();
    }
  }

  useProxyFactory<R>(f: (factory: Factory) => R): Promise<R> {
    // Proxy factory is connect to the wallet
    return this.useWallet(() => f(this.proxyFactory));
  }

  connectAccount(account: Addresslike): Account {
    return Account__factory.connect(asAddress(account), this);
  }

  async lookupAddress(address: string | Promise<string>): Promise<string | null> {
    try {
      return await super.lookupAddress(address);
    } catch {
      return null;
    }
  }

  async asApproval(options: Omit<VerifySignatureOptions, 'provider'>) {
    return asApproval({ ...options, provider: this });
  }

  async verifySignature(options: Omit<VerifySignatureOptions, 'provider'>) {
    return this.asApproval(options) !== null;
  }

  async getProxyAddress(args: Omit<DeployArgs, 'factory'>) {
    return getProxyAddress({ ...args, factory: this.proxyFactory }); // Only uses (read-only) static call so it doesn't require locking
  }

  async deployProxy(args: Omit<DeployArgs, 'factory'>) {
    return this.useProxyFactory((factory) => deployAccountProxy({ ...args, factory }));
  }

  async balance(args: BalanceArgs): Promise<bigint> {
    const key = getBalanceKey(args);
    const cached = await this.redis.get(key);
    if (cached) return BigInt(cached);

    const { account, token } = args;
    const balance = await tryOrIgnoreAsync(async () => {
      if (token === ETH_ADDRESS) return await this.client.getBalance({ address: account });

      return await this.client.readContract({
        abi: ERC20_ABI,
        address: token,
        functionName: 'balanceOf',
        args: [account],
      });
    });

    // Balance must be expired due to rebalancing tokens
    if (balance !== undefined) this.redis.set(key, balance.toString(), 'EX', 3600 /* 1 hour */);

    return balance ?? 0n;
  }

  invalidateBalance(args: BalanceArgs) {
    return this.redis.del(getBalanceKey(args));
  }
}
