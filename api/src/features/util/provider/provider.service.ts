import { Injectable } from '@nestjs/common';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/config';
import {
  Address,
  Account,
  Factory,
  Factory__factory,
  Chain,
  ApprovalsRule,
  Account__factory,
  Addresslike,
  asAddress,
} from 'lib';
import { Mutex } from 'async-mutex';
import { BytesLike } from 'ethers';
import { SignatureLike } from '@ethersproject/bytes';

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;

  private walletMutex = new Mutex();
  private wallet: zk.Wallet;
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

  connectAccount(account: Addresslike): Account {
    return Account__factory.connect(asAddress(account), this);
  }

  useWallet<R>(f: (wallet: zk.Wallet) => R): Promise<R> {
    return this.walletMutex.runExclusive(() => f(this.wallet));
  }

  get walletAddress(): Address {
    return this.wallet.address;
  }

  useProxyFactory<R>(f: (factory: Factory) => R): Promise<R> {
    // Proxy factory is connect to the wallet
    return this.walletMutex.runExclusive(() => f(this.proxyFactory));
  }

  async lookupAddress(address: string | Promise<string>): Promise<string | null> {
    try {
      return await super.lookupAddress(address);
    } catch {
      return null;
    }
  }

  async isValidSignatureNow(addr: Address, digest: BytesLike, signature: SignatureLike) {
    return ApprovalsRule.isValidSignatureNow(this, addr, digest, signature);
  }
}
