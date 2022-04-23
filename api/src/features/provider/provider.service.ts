import { Injectable } from '@nestjs/common';
import { Wallet } from 'ethers';
import CONFIG from 'config';
import { Chain, Factory, getChain, getFactory } from 'lib';

@Injectable()
export class ProviderService {
  public chain: Chain;
  public wallet: Wallet;
  public factory: Factory;

  constructor() {
    this.chain = getChain(CONFIG.chain!);
    this.wallet = new Wallet(CONFIG.wallet.privateKey!);
    this.factory = getFactory(CONFIG.factory[this.chain.name], this.wallet);
  }
}
