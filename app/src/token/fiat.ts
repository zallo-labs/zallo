import { BigNumber } from 'ethers';

export const FIAT_DECIMALS = 8;
const multiplier = 10 ** FIAT_DECIMALS;

export const fiatToBigNumber = (value: string | number): BigNumber => {
  if (typeof value === 'string') value = parseFloat(value);

  return BigNumber.from((value * multiplier).toFixed(0));
};

export const bigNumberToFiat = (value: BigNumber) => value.toNumber() / FIAT_DECIMALS;
