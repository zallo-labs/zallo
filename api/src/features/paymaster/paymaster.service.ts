import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import assert from 'assert';
import { UAddress, asAddress, asHex } from 'lib';
import { hexlify } from 'ethers';
import { utils as zkUtils } from 'zksync2-js';

const testnetPaymaster = asAddress('0x8f0ea1312da29f17eabeb2f484fd3c112cccdd63');

interface GetPaymasterParamsOptions {
  feeToken: UAddress;
  gas: bigint;
  maxFeePerGas: bigint;
}

@Injectable()
export class PaymasterService {
  constructor(private networks: NetworksService) {}

  async getPaymaster() {
    return testnetPaymaster;
  }

  paymasterInput({ feeToken, gas, maxFeePerGas }: GetPaymasterParamsOptions) {
    return asHex(
      hexlify(
        zkUtils.getApprovalBasedPaymasterInput({
          type: 'ApprovalBased',
          token: feeToken,
          minimalAllowance: gas * maxFeePerGas, // Mainnet TODO: factor in conversion from token -> ETH; 1:1 on testnet
          innerInput: '0x',
        }),
      ),
    );
  }

  async getGasPrice(feeToken: UAddress) {
    const network = this.networks.for(feeToken);
    assert(network.chain.testnet);

    try {
      const ethGasPrice = await network.getGasPrice();

      // Mainnet TODO: convert from eth -> fee token

      return ethGasPrice;
    } catch (e) {
      console.warn(`Failed to fetch gas price for ${feeToken}: ${e}`);
      return null;
    }
  }
}
