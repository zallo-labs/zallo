import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import assert from 'assert';
import { Address, CHAINS, asAddress } from 'lib';
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
  constructor(private networks: NetworksService) {}

  async getPaymaster() {
    const network = this.networks.get(CHAINS['zksync-goerli']); // Mainnet TODO: paymaster address
    const paymaster = await network.provider.getTestnetPaymasterAddress();
    if (!paymaster) throw new Error('Failed to get testnet paymaster address');

    return asAddress(paymaster);
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

  async getGasPrice(feeToken: Address) {
    const network = this.networks.for(feeToken);
    assert(network.chain.testnet); // Mainnet TODO: get correct gas price
    // On testnet the conversion is 1:1 token:ETH (wei)

    try {
      return await network.getGasPrice();
    } catch (e) {
      console.warn(`Failed to fetch gas price for ${feeToken}: ${e}`);
      return null;
    }
  }
}
