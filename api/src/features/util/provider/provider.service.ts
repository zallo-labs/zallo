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
} from 'lib';
import { Mutex } from 'async-mutex';
import { PublicClient, WebSocketTransport, createPublicClient, webSocket } from 'viem';
import { LRUCache } from 'lru-cache';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

interface BalanceKey {
  account: Address;
  token: Address;
}

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;
  public client: PublicClient<WebSocketTransport, typeof CONFIG.chain>;
  private wallet: zk.Wallet;
  private walletMutex = new Mutex(); // TODO: replace with distributed mutex - https://linear.app/zallo/issue/ZAL-91
  private proxyFactory: Factory;
  private balancesCache = new LRUCache<string, bigint>({
    fetchMethod: (key) => this.fetchBalance(key),
    max: 100_000,
    ttl: 15_000, // 15s
    // Return stale value, then fetch in background
    allowStale: true,
    // Re-use stale value if fetch fails
    allowStaleOnFetchRejection: true,
    noDeleteOnFetchRejection: true,
  });

  constructor() {
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

  useWallet<R>(f: (wallet: zk.Wallet) => R): Promise<R> {
    return this.walletMutex.runExclusive(() => f(this.wallet));
  }

  useProxyFactory<R>(f: (factory: Factory) => R): Promise<R> {
    // Proxy factory is connect to the wallet
    return this.walletMutex.runExclusive(() => f(this.proxyFactory));
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

  async balance(key: BalanceKey): Promise<bigint> {
    return (await this.balancesCache.fetch(`${key.account}-${key.token}`)) ?? 0n;
  }

  private async fetchBalance(key: string) {
    const [account, token] = key.split('-') as [Address, Address];

    if (token === ETH_ADDRESS) return await this.client.getBalance({ address: account });

    return await this.client.readContract({
      abi: ERC20_ABI,
      address: token,
      functionName: 'balanceOf',
      args: [account],
    });
  }
}
