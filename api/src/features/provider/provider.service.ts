import { BaseProvider } from '@ethersproject/providers';
import { Injectable } from '@nestjs/common';
import CONFIG from 'config';
import { ethers } from 'ethers';
import { getChain, getFactory, SafeFactory } from 'lib';

const chain = getChain(CONFIG.chain);

@Injectable()
export class ProviderService extends BaseProvider {
  public safeFactory: SafeFactory;

  constructor() {
    super({
      name: chain.name,
      chainId: chain.id,
    });
    Object.assign(
      this,
      ethers.getDefaultProvider(chain.name, CONFIG.providers),
    );

    this.safeFactory = getFactory(CONFIG.factoryAddress());
  }
}
