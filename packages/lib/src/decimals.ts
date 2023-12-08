import Decimal from 'decimal.js';

Decimal.set({ precision: 30 });

export type Decimallike = number | string | Decimal;

const ten = new Decimal(10);

export function asFp(
  amount: Decimal,
  decimals: Decimalslike,
  rounding: Decimal.Rounding = Decimal.ROUND_UP,
) {
  return BigInt(amount.mul(ten.pow(getDecimals(decimals))).toFixed(0, rounding));
}

export function asDecimal(amount: bigint, decimals: Decimalslike) {
  return new Decimal(amount.toString()).div(ten.pow(getDecimals(decimals)));
}

type Decimalslike = number | { decimals: number };

function getDecimals(d: Decimalslike) {
  return typeof d === 'number' ? d : d.decimals;
}
