import { Injectable, OnModuleInit } from '@nestjs/common';
import { NetworksService } from '~/core/networks/networks.service';
import { PAYMASTER, UAddress, asUAddress } from 'lib';
import { Chain } from 'chains';
import { FeesPerGas } from '~/feat/paymasters/paymasters.model';
import { PricesService } from '~/feat/prices/prices.service';
import { DatabaseService } from '~/core/database';
import { TokensService } from '~/feat/tokens/tokens.service';
import e from '~/edgeql-js';
import Decimal from 'decimal.js';
import { ActivationsService } from '../activations/activations.service';
import { PaymasterFeeParts } from './paymasters.model';
import { and } from '~/core/database';

interface PaymasterFeesParams {
  account: UAddress;
}

@Injectable()
export class PaymastersService implements OnModuleInit {
  private feeTokens = new Set<UAddress>();

  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private prices: PricesService,
    private tokens: TokensService,
    private activations: ActivationsService,
  ) {}

  async onModuleInit() {
    await this.initFeeTokens();
  }

  for(chain: Chain) {
    const paymaster = PAYMASTER.address[chain];
    if (!paymaster) throw new Error(`Paymaster not deployed on ${chain}`);
    return paymaster;
  }

  async paymasterFees({ account }: PaymasterFeesParams): Promise<PaymasterFeeParts> {
    const feePerGas = await this.networks.get(account).estimatedMaxFeePerGas();

    const activation = await this.activations.fee({ account, feePerGas });

    return { activation: activation ?? new Decimal(0) };
  }

  async estimateFeePerGas(feeToken: UAddress): Promise<FeesPerGas | null> {
    if (!this.feeTokens.has(feeToken)) return null;

    try {
      const [ethPerGas, tokenPrice, decimals] = await Promise.all([
        this.networks.get(feeToken).estimatedFeesPerGas(),
        this.prices.price(feeToken),
        this.tokens.decimals(feeToken),
      ]);

      return {
        id: `FeesPerGas:${feeToken}`,
        maxFeePerGas: ethPerGas.maxFeePerGas.div(tokenPrice.eth),
        maxPriorityFeePerGas: ethPerGas.maxPriorityFeePerGas.div(tokenPrice.eth),
        feeTokenDecimals: decimals,
      };
    } catch (e) {
      console.error(`Failed to fetch gas price for ${feeToken}: ${e}`);
      return null;
    }
  }

  private async initFeeTokens() {
    const r = await this.db.query(
      e.select(e.Token, (t) => ({
        filter: and(t.isSystem, t.isFeeToken),
        address: true,
      })).address,
    );

    this.feeTokens = new Set(r.map((v) => asUAddress(v)));
  }
}
