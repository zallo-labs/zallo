import { formatUnits } from 'viem';

export const FIAT_DECIMALS = 16;

export function tokenToToken(amount: bigint, curDecimals: number, newDecimals: number): bigint {
  const decimalsDiff = curDecimals - newDecimals;
  const factor = 10n ** BigInt(Math.abs(decimalsDiff));

  return decimalsDiff >= 0 ? BigInt(amount) / factor : BigInt(amount) * factor;
}

export function fiatToToken(value: number, price: number, decimals: number): bigint {
  return (
    (numberToBigInt(value, FIAT_DECIMALS) * 10n ** BigInt(decimals)) /
    numberToBigInt(price, FIAT_DECIMALS)
  );
}

export function tokenToFiat(amount: bigint, price: number, decimals: number): number {
  return bigIntToNumber(
    BigInt(amount) * numberToBigInt(price, FIAT_DECIMALS),
    FIAT_DECIMALS + decimals,
  );
}

function numberToBigInt(value: string | number, decimals: number): bigint {
  return BigInt(
    Math.floor((typeof value === 'number' ? value : parseFloat(value)) * 10 ** decimals),
  );
}

function bigIntToNumber(value: bigint, decimals: number): number {
  return parseFloat(formatUnits(value, decimals));
}
