import { Injectable } from '@nestjs/common';
import { Wallet } from 'ethers';
import CONFIG, { Chain } from 'config';
import { Factory, getFactory } from 'lib';

@Injectable()
export class ProviderService {
  public chain: Chain;
  public wallet: Wallet;
  public factory: Factory;

  constructor() {
    this.chain = CONFIG.chain;
    this.wallet = new Wallet(CONFIG.wallet.privateKey!);
    this.factory = getFactory(CONFIG.factoryAddress, this.wallet);
  }
}
