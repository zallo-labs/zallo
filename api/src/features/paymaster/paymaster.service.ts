import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import assert from 'assert';
import { UAddress, asAddress, asHex } from 'lib';
import { CHAINS } from 'chains';
import * as zk from 'zksync-web3';
import { BigNumber } from 'ethers';
import { hexlify } from 'ethers/lib/utils';

interface GetPaymasterParamsOptions {
  feeToken: UAddress;
  gas: bigint;
  maxFeePerGas: bigint;
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

  paymasterInput({ feeToken, gas, maxFeePerGas }: GetPaymasterParamsOptions) {
    return asHex(
      hexlify(
        zk.utils.getApprovalBasedPaymasterInput({
          type: 'ApprovalBased',
          token: feeToken,
          minimalAllowance: BigNumber.from(gas * maxFeePerGas), // Mainnet TODO: factor in conversion from token -> ETH; 1:1 on testnet
          innerInput: [],
        }),
      ),
    );
  }

  async getGasPrice(feeToken: UAddress) {
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
