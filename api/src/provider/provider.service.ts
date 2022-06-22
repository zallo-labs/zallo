import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as zk from 'zksync-web3';
import CONFIG, { Chain } from 'config';
import { Factory, getFactory } from 'lib';

@Injectable()
export class ProviderService extends zk.Provider {
  public chain: Chain;
  public ethProvider: ethers.providers.Provider;
  public wallet: zk.Wallet;
  public factory: Factory;

  constructor() {
    super(CONFIG.chain.zksyncUrl);
    this.chain = CONFIG.chain;
    this.ethProvider = ethers.providers.getDefaultProvider(this.chain.ethUrl);

    this.wallet = zk.Wallet.createRandom().connect(this).connectToL1(this.ethProvider);
    this.factory = getFactory(CONFIG.factoryAddress!, this.wallet);
  }
}
