import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import {
  Address,
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
import { TokensService, preferUserToken } from '~/features/tokens/tokens.service';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';
import Decimal from 'decimal.js';
import { selectAccount } from '~/features/accounts/accounts.util';
import { $anyreal, $decimal } from '~/edgeql-js/modules/std';
import { $expr_Select } from '~/edgeql-js/select';
import { Cardinality } from '~/edgeql-js/reflection';
import { Price } from '~/features/prices/prices.model';
import { ActivationsService } from '../activations/activations.service';

interface UsePaymasterParams {
  account: UAddress;
  gasLimit: bigint;
  feeToken: Address;
  paymasterEthFee: Decimal;
}

interface PaymasterEthFeeParams {
  account: UAddress;
}

type SelectedReal = $expr_Select<{
  __element__: $anyreal;
  __cardinality__: Cardinality.One;
}>;
type SelectedDecimal = $expr_Select<{
  __element__: $decimal;
  __cardinality__: Cardinality.One;
}>;

@Injectable()
export class PaymastersService {
  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private prices: PricesService,
    private tokens: TokensService,
    private activations: ActivationsService,
  ) {}

  for(chain: Chain) {
    const paymaster = PAYMASTER.address[chain];
    if (!paymaster) throw new Error(`Paymaster not deployed on ${chain}`);
    return paymaster;
  }

  async usePaymaster({ account, gasLimit, feeToken, paymasterEthFee }: UsePaymasterParams) {
    const chain = asChain(account);
    const paymaster = this.for(chain);

    const maxEthFeePerGas = await this.estimateMaxEthFeePerGas(chain);
    const maxNetworkEthFee = maxEthFeePerGas.mul(gasLimit.toString());
    const ethDiscount = await this.useEthDiscount(account, maxNetworkEthFee, paymasterEthFee, true);
    const maxEthFees = maxNetworkEthFee.plus(paymasterEthFee).minus(ethDiscount);

    const tokenPrice = await this.prices.price(asUAddress(feeToken, chain));
    const maxTokenFees = maxEthFees.div(tokenPrice.eth);

    await this.prices.updatePriceFeedsIfNecessary(chain, [ETH.pythUsdPriceId, tokenPrice.id]);

    const signedData: PaymasterSignedData = {
      paymasterFee: asFp(paymasterEthFee, ETH),
      discount: asFp(ethDiscount, ETH),
    };
    const network = this.networks.get(chain);
    const nonce = BigInt(await network.getTransactionCount({ address: asAddress(account) }));
    const paymasterSignature = await network.useWallet(async (wallet) =>
      wallet.signTypedData(
        paymasterSignedDataAsTypedData({
          paymaster: asUAddress(paymaster, asChain(account)),
          account: asAddress(account),
          nonce,
          ...signedData,
        }),
      ),
    );

    return {
      paymaster,
      paymasterInput: encodePaymasterInput({
        amount: await this.tokens.asFp(asUAddress(feeToken, chain), maxTokenFees),
        token: feeToken,
        paymasterSignature: signatureToCompactSignature(hexToSignature(paymasterSignature)),
        ...signedData,
      }),
      maxEthFeePerGas,
      ethDiscount,
      tokenPrice,
    };
  }

  async estimateMaxEthFeePerGas(chain: Chain): Promise<Decimal> {
    return asDecimal((await this.networks.get(chain).estimateFeesPerGas()).maxFeePerGas!, ETH);
  }

  async estimateFeePerGas(feeToken: UAddress, tokenPriceParam?: Price): Promise<FeesPerGas | null> {
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
      const ethPerGas = await this.networks.get(feeToken).estimateFeesPerGas();
      const tokenPrice =
        tokenPriceParam ?? (await this.prices.price(asHex(metadata.pythUsdPriceId)));

      const tokenPerGas = (ethPerGasFee: bigint) =>
        asDecimal(ethPerGasFee, ETH.decimals).div(tokenPrice.eth);

      return {
        id: `FeesPerGas:${feeToken}`,
        maxFeePerGas: tokenPerGas(ethPerGas.maxFeePerGas!),
        maxPriorityFeePerGas: tokenPerGas(ethPerGas.maxPriorityFeePerGas!),
        feeTokenDecimals: metadata.decimals,
      };
    } catch (e) {
      console.warn(`Failed to fetch gas price for ${feeToken}: ${e}`);
      return null;
    }
  }

  async estimateFeePerGasOrThrow(feeToken: UAddress, tokenPriceParam?: Price): Promise<FeesPerGas> {
    const r = await this.estimateFeePerGas(feeToken, tokenPriceParam);
    if (!r) throw new Error(`Failed to estimate fees per gas for ${feeToken}`);
    return r;
  }

  async estimateEthDiscount(
    account: UAddress,
    maxNetworkEthFee: Decimal,
    paymasterEthFee: Decimal,
  ): Promise<Decimal> {
    return this.useEthDiscount(account, maxNetworkEthFee, paymasterEthFee, false);
  }

  private async useEthDiscount(
    account: UAddress,
    maxNetworkEthFee: Decimal,
    maxPaymasterEthFee: Decimal,
    use: boolean,
  ): Promise<Decimal> {
    return this.db.transaction(async (db) => {
      const selectedAccount = selectAccount(account);
      const accountCredit = e.assert_exists(
        e.select(selectedAccount, () => ({ paymasterEthCredit: true })).paymasterEthCredit,
      );

      // Provide a discount if currentPaymasterEthFee < maxPaymasterEthFee; ensuring the user benefits in case of feeToken:eth price change etc.
      const currentPaymasterEthFee = await this.paymasterEthFee({ account });
      const paymasterEthFeeDiscount = Decimal.min(
        maxPaymasterEthFee.minus(currentPaymasterEthFee),
        0,
      );
      const paymasterEthFee = maxPaymasterEthFee.plus(paymasterEthFeeDiscount);
      const maxEthCreditToUse = maxNetworkEthFee.plus(paymasterEthFee);

      // e.min(e.decimal) doesn't type correctly - https://github.com/edgedb/edgedb-js/issues/594
      const selectCreditUsed = e.select(
        e.min(e.set(accountCredit, e.decimal(maxEthCreditToUse.toString()))),
      ) satisfies SelectedReal as SelectedDecimal;

      const r = await e
        .select({
          creditUsed: selectCreditUsed,
          account: use
            ? e.update(selectedAccount, (a) => ({
                set: {
                  paymasterEthCredit: e.select(
                    e.max(e.set(e.op(a.paymasterEthCredit, '-', selectCreditUsed), e.decimal('0'))),
                  ) satisfies SelectedReal as SelectedDecimal,
                },
              }))
            : e.select(''),
        })
        .run(db);

      const discount = paymasterEthFeeDiscount.plus(r.creditUsed);
      return discount;
    });
  }

  async paymasterEthFee({ account }: PaymasterEthFeeParams): Promise<Decimal> {
    const feePerGas = await this.estimateMaxEthFeePerGas(asChain(account));
    const activationGas = (await this.activations.estimateGas(account))?.toString() ?? 0;
    const activationFee = feePerGas.mul(activationGas);

    return activationFee;
  }
}
