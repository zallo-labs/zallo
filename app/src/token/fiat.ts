import { BigNumber } from 'ethers';
import { Token } from './token';

export const FIAT_DECIMALS = 8;
const multiplier = 10 ** FIAT_DECIMALS;

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
): BigNumber =>
  fiatValue
    .mul(fiatPrice)
    .div(BigNumber.from(10).pow(2 * FIAT_DECIMALS - token.decimals));
