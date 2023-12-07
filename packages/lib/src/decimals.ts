import Decimal from 'decimal.js';

Decimal.set({ precision: 30 });

export type Decimallike = number | string | Decimal;

const ten = new Decimal(10);

export function asFp(
  amount: Decimal,
  decimals: number,
  rounding: Decimal.Rounding = Decimal.ROUND_UP,
) {
  return BigInt(amount.mul(ten.pow(decimals)).toFixed(0, rounding));
}

export function fromFp(amount: bigint, decimals: number) {
  return new Decimal(amount.toString()).div(ten.pow(decimals));
}
