import { parseFixed, BigNumber } from "@ethersproject/bignumber";

export const WEIGHT_PRECISION = 28;
export const percentToFixedWeight = (weight: number) =>
  parseFixed(`${weight}`, WEIGHT_PRECISION - 2);

export const _100_PERCENT_WEIGHT = percentToFixedWeight(100);

export const fixedWeightToPercent = (weight: BigNumber): number =>
  weight.div(_100_PERCENT_WEIGHT.div(100)).toNumber();
