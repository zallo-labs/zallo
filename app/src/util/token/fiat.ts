import { BigNumber } from 'ethers';
import { TEN } from 'lib';
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
  fiat: BigNumber,
  fiatPrice: BigNumber,
  token: Token,
): BigNumber => fiat.mul(TEN.pow(token.decimals)).div(fiatPrice);
