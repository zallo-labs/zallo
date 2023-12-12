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
  asDecimal,
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
import Decimal from 'decimal.js';
import { selectAccount } from '~/features/accounts/accounts.util';
import { $anyreal, $decimal } from '~/edgeql-js/modules/std';
import { $expr_Select } from '~/edgeql-js/select';
import { Cardinality } from '~/edgeql-js/reflection';

interface CurrentParamsOptions {
  account: UAddress;
  zksyncNonce: bigint;
  gas: bigint;
  feeToken: Address;
  paymasterFee: Decimal;
  discount?: Decimal;
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

  async currentParams({
    account,
    zksyncNonce,
    gas,
    feeToken,
    paymasterFee,
    discount,
  }: CurrentParamsOptions) {
    const chain = asChain(account);
    const paymaster = this.for(chain);

    const signedData: PaymasterSignedData = {
      paymasterFee: asFp(paymasterFee, ETH),
      discount: discount ? asFp(discount, ETH) : 0n,
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
      fees,
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
        asDecimal(ethPerGasFee, ETH.decimals).div(price.eth.current);

      return {
        id: `FeesPerGas:${feeToken}`,
        maxFeePerGas: tokenPerGas(ethPerGas.maxFeePerGas!),
        maxPriorityFeePerGas: tokenPerGas(ethPerGas.maxPriorityFeePerGas!),
        decimals: metadata.decimals,
      };
    } catch (e) {
      console.warn(`Failed to fetch gas price for ${feeToken}: ${e}`);
      return null;
    }
  }

  async useDiscount(account: UAddress, gas: bigint): Promise<Decimal> {
    return this._discount(account, gas, true);
  }

  async estimateDiscount(account: UAddress, gas: bigint): Promise<Decimal> {
    return this._discount(account, gas, false);
  }

  private async _discount(account: UAddress, gas: bigint, use: boolean): Promise<Decimal> {
    const chain = asChain(account);
    const fees = await this.estimateFeesPerGas(asUAddress(ETH.address[chain], chain));
    if (!fees) throw new Error('Failed to estimate fees');

    const maxDiscount = fees.maxFeePerGas.mul(new Decimal(gas.toString()));

    return this.db.transaction(async (db) => {
      const selectedAccount = selectAccount(account);
      const accountCredit = e.assert_exists(
        e.select(selectedAccount, () => ({ paymasterEthCredit: true })).paymasterEthCredit,
      );

      type SelectedReal = $expr_Select<{
        __element__: $anyreal;
        __cardinality__: Cardinality.One;
      }>;
      type SelectedDecimal = $expr_Select<{
        __element__: $decimal;
        __cardinality__: Cardinality.One;
      }>;
      // e.min(e.decimal) doesn't type correctly - https://github.com/edgedb/edgedb-js/issues/594
      const discount = e.select(
        e.min(e.set(accountCredit, e.decimal(maxDiscount.toString()))),
      ) satisfies SelectedReal as SelectedDecimal;

      const r = await e
        .select({
          discount,
          account: use
            ? e.update(selectedAccount, (a) => ({
                set: {
                  paymasterEthCredit: e.select(
                    e.max(e.set(e.op(a.paymasterEthCredit, '-', discount), e.decimal('0'))),
                  ) satisfies SelectedReal as SelectedDecimal,
                },
              }))
            : e.select(''),
        })
        .run(db);

      return new Decimal(r.discount);
    });
  }

  fee(operations: Operation[]): Decimal {
    return new Decimal(0);
  }
}
