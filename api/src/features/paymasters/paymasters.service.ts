import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import {
  Address,
  Operation,
  PAYMASTER,
  PaymasterSignedData,
  UAddress,
  asAddress,
  asChain,
  asFp,
  asHex,
  asUAddress,
  encodePaymasterInput,
  fromFp,
  paymasterSignedDataAsTypedData,
} from 'lib';
import { Chain } from 'chains';
import { hexToSignature, signatureToCompactSignature } from 'viem';
import { FeesPerGas } from '~/features/paymasters/paymasters.model';
import { PricesService } from '~/features/prices/prices.service';
import { DatabaseService } from '~/features/database/database.service';
import { preferUserToken } from '~/features/tokens/tokens.service';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';

interface GetPaymasterParamsOptions {
  account: UAddress;
  zksyncNonce: bigint;
  gas: bigint;
  feeToken: Address;
  paymasterFee: bigint;
}

@Injectable()
export class PaymastersService {
  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private prices: PricesService,
  ) {}

  for(chain: Chain) {
    const paymaster = PAYMASTER.address[chain];
    if (!paymaster) throw new Error(`Paymaster not deployed on ${chain}`);
    return paymaster;
  }

  async getCurrentParams({
    account,
    zksyncNonce,
    gas,
    feeToken,
    paymasterFee,
  }: GetPaymasterParamsOptions) {
    const chain = asChain(account);
    const paymaster = this.for(chain);

    const signedData: PaymasterSignedData = {
      paymasterFee,
      discount: await this.useRefundCredit(account),
    };
    const paymasterSignature = await this.networks.get(chain).useWallet(async (wallet) =>
      wallet.signTypedData(
        paymasterSignedDataAsTypedData({
          paymaster: asUAddress(paymaster, asChain(account)),
          account: asAddress(account),
          nonce: zksyncNonce,
          ...signedData,
        }),
      ),
    );

    const feeTokenUAddress = asUAddress(feeToken, chain);
    const fees = await this.estimateFeesPerGas(feeTokenUAddress);
    if (!fees) throw new Error('Failed to estimate fees');

    const feeTokenPriceId = await this.prices.getUsdPriceId(feeTokenUAddress);
    if (!feeTokenPriceId) throw new Error(`Missing Pyth USD price id for ${feeTokenUAddress}`);
    await this.prices.updateOnchainPriceFeedsIfNecessary(chain, [
      ETH.pythUsdPriceId,
      feeTokenPriceId,
    ]);

    return {
      paymaster,
      paymasterInput: encodePaymasterInput({
        amount: gas * asFp(fees.maxFeePerGas, fees.decimals),
        token: feeToken,
        paymasterSignature: signatureToCompactSignature(hexToSignature(paymasterSignature)),
        ...signedData,
      }),
    };
  }

  async estimateFeesPerGas(feeToken: UAddress): Promise<FeesPerGas | null> {
    const metadata = await this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: e.op(t.address, '=', feeToken),
          limit: 1,
          order_by: preferUserToken(t),
          decimals: true,
          pythUsdPriceId: true,
          isFeeToken: true,
        })),
      ),
    );
    if (!metadata || !metadata.isFeeToken || !metadata.pythUsdPriceId) return null;

    try {
      const price = await this.prices.feed(asHex(metadata.pythUsdPriceId));
      if (!price) return null;

      const ethPerGas = await this.networks.for(feeToken).estimateFeesPerGas();

      const tokenPerGas = (ethPerGasFee: bigint) =>
        fromFp(ethPerGasFee, ETH.decimals).div(price.eth.current);

      return {
        maxFeePerGas: tokenPerGas(ethPerGas.maxFeePerGas!),
        maxPriorityFeePerGas: tokenPerGas(ethPerGas.maxPriorityFeePerGas!),
        decimals: metadata.decimals,
      };
    } catch (e) {
      console.warn(`Failed to fetch gas price for ${feeToken}: ${e}`);
      return null;
    }
  }

  private async useRefundCredit(account: UAddress): Promise<bigint> {
    // TODO: provide discount based on RefundCredit
    return 0n;
  }

  async fee(operations: Operation[]): Promise<bigint> {
    // TODO:
    return 0n;
  }
}
