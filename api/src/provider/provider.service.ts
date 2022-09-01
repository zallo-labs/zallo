import { Injectable } from '@nestjs/common';
import * as zk from 'zksync-web3';
import CONFIG, { Chain } from 'config';
import { Address, Account, connectAccount } from 'lib';

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;
  public wallet: zk.Wallet;

  constructor() {
    super(CONFIG.chain.zksyncUrl);
    this.chain = CONFIG.chain;

    const wallet =
      this.chain.isTestnet && CONFIG.wallet.privateKey
        ? new zk.Wallet(CONFIG.wallet.privateKey)
        : zk.Wallet.createRandom();
    this.wallet = wallet.connect(this);
  }

  public connectAccount(account: Address): Account {
    return connectAccount(account, this);
  }
}
