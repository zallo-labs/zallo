import { Injectable } from '@nestjs/common';
import * as zk from 'zksync-web3';
import CONFIG, { Chain } from 'config';
import {
  Address,
  Account,
  connectAccount,
  Factory,
  Factory__factory,
} from 'lib';

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;
  public wallet: zk.Wallet;
  public proxyFactory: Factory;

  constructor() {
    super(CONFIG.chain.zksyncUrl);
    this.chain = CONFIG.chain;

    this.wallet = (
      this.chain.isTestnet && CONFIG.wallet.privateKey
        ? new zk.Wallet(CONFIG.wallet.privateKey)
        : zk.Wallet.createRandom()
    ).connect(this);

    this.proxyFactory = Factory__factory.connect(
      CONFIG.proxyFactoryAddress!,
      this.wallet,
    );
  }

  public connectAccount(account: Address): Account {
    return connectAccount(account, this);
  }
}
