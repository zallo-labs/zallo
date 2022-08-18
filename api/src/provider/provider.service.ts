import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as zk from 'zksync-web3';
import CONFIG, { Chain } from 'config';
import { Address, Account, connectAccount } from 'lib';

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;
  public ethProvider: ethers.providers.Provider;
  public wallet: zk.Wallet;

  constructor() {
    super(CONFIG.chain.zksyncUrl);
    this.chain = CONFIG.chain;
    this.ethProvider = ethers.providers.getDefaultProvider(this.chain.ethUrl);

    const wallet =
      this.chain.isTestnet && CONFIG.wallet.privateKey
        ? new zk.Wallet(CONFIG.wallet.privateKey)
        : zk.Wallet.createRandom();
    this.wallet = wallet.connect(this).connectToL1(this.ethProvider);
  }

  public connectAccount(account: Address): Account {
    return connectAccount(account, this);
  }
}
