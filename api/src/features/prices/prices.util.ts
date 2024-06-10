import { PriceFeed } from '@pythnetwork/pyth-evm-js';
import Decimal from 'decimal.js';

export interface PriceData {
  current: Decimal;
  ema: Decimal;
}

const TEN = new Decimal(10);

export function extractFeedPrice(feed: PriceFeed): PriceData {
  const current = feed.getPriceUnchecked();
  const ema = feed.getEmaPriceUnchecked();

  return {
    current: new Decimal(current.price).mul(TEN.pow(current.expo)),
    ema: new Decimal(ema.price).mul(TEN.pow(ema.expo)),
  };
}
