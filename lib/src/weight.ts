import { parseFixed } from '@ethersproject/bignumber';
import { BigNumber, ethers } from 'ethers';

const weightPrecision = 28;
const percentPrecision = 2;

export const percentToFixedWeight = (weight: number) =>
  parseFixed(`${weight}`, weightPrecision - percentPrecision);

export const PERCENT_THRESHOLD = 100;
export const WEIGHT_THRESHOLD = percentToFixedWeight(PERCENT_THRESHOLD);

export const fixedWeightToPercent = (weight: BigNumber): number =>
  parseFloat(
    ethers.utils.formatUnits(weight, weightPrecision - percentPrecision),
  );
