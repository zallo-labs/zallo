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
} from 'lib';
import { Mutex } from 'async-mutex';

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;

  private wallet: zk.Wallet;
  private walletMutex = new Mutex(); // TODO: replace with distributed mutex - https://linear.app/zallo/issue/ZAL-91
  private proxyFactory: Factory;

  constructor() {
    super(CONFIG.chain.rpc);
    this.chain = CONFIG.chain;

    this.wallet = (
      this.chain.isTestnet && CONFIG.walletPrivateKey
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
}
