import { BigNumber } from 'ethers';
import { Token } from './token';

export const FIAT_DECIMALS = 8;
const multiplier = 10 ** FIAT_DECIMALS;
const TEN = BigNumber.from(10);

export const fiatToBigNumber = (value: string | number): BigNumber => {
  if (typeof value === 'string') value = parseFloat(value);

  return BigNumber.from((value * multiplier).toFixed(0));
};

export const bigNumberToFiat = (value: BigNumber) =>
  value.toNumber() / FIAT_DECIMALS;

export const fiatToToken = (
  fiatValue: BigNumber,
  fiatPrice: BigNumber,
  token: Token,
  ): BigNumber => {
  const v = fiatValue.mul(fiatPrice);

  // BigNumber doesn't allow negative powers, so we must div if we want to use a negative power
  const netDecimals = token.decimals - 2 * FIAT_DECIMALS;
  const n = TEN.pow(Math.abs(netDecimals));

  return netDecimals >= 0 ? v.mul(n) : v.div(n);
};
