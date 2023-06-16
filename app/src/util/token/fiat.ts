import { Token } from './token';

export const FIAT_DECIMALS = 8;
const multiplier = 10 ** FIAT_DECIMALS;

export const fiatAsBigInt = (value: string | number): bigint =>
  BigInt(Math.floor((typeof value === 'number' ? value : parseFloat(value)) * multiplier));

// export const asFiat = (value: bigint) => value / BigInt(FIAT_DECIMALS);

export const fiatToToken = (fiat: bigint, fiatPrice: bigint, token: Token): bigint =>
  (fiat * 10n ** BigInt(token.decimals)) / fiatPrice;

export const tokenToFiat = (token: Token, amount: bigint, price: bigint): bigint =>
  (amount * price) / 10n ** BigInt(token.decimals);
