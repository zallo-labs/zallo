import { PriceUpdate } from '@pythnetwork/hermes-client';
import Decimal from 'decimal.js';

export interface PriceData {
  current: Decimal;
  ema: Decimal;
}

const TEN = new Decimal(10);

export type ParsedPriceUpdate = NonNullable<PriceUpdate['parsed']>[0];

export function parsePriceUpdate({ price, ema_price }: ParsedPriceUpdate) {
  return {
    current: new Decimal(price.price).mul(TEN.pow(price.expo)),
    ema: new Decimal(ema_price.price).mul(TEN.pow(ema_price.expo)),
  } satisfies PriceData;
}
