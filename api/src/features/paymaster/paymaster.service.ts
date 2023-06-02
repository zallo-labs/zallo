import { Injectable } from '@nestjs/common';
import { ProviderService } from '../util/provider/provider.service';
import assert from 'assert';
import { Address, asAddress } from 'lib';
import * as zk from 'zksync-web3';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { BigNumber } from 'ethers';

interface GetPaymasterParamsOptions {
  feeToken: Address;
  gasPrice: bigint;
  gasLimit: bigint;
}

@Injectable()
export class PaymasterService {
  constructor(private provider: ProviderService) {}

  async getPaymaster() {
    assert(this.provider.chain.isTestnet); // Mainnet TODO: testnet paymaster can't be used
    const paymaster = await this.provider.getTestnetPaymasterAddress();
    if (!paymaster) throw new Error('Failed to get testnet paymaster address');

    return asAddress(paymaster);
  }

  async isSupportedFeeToken(token: Address) {
    return true; // TODO: restrict to supported paymaster tokens
  }

  async getPaymasterParams({ feeToken, gasPrice, gasLimit }: GetPaymasterParamsOptions) {
    if (feeToken === ETH_ADDRESS) return undefined;

    const paymaster = await this.getPaymaster();

    return zk.utils.getPaymasterParams(paymaster, {
      type: 'ApprovalBased',
      token: feeToken,
      minimalAllowance: BigNumber.from(gasPrice * gasLimit), // Mainnet TODO: factor in conversion from token -> ETH; 1:1 on testnet
      innerInput: [],
    });
  }
}
