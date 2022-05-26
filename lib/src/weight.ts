import { parseFixed } from '@ethersproject/bignumber';
import { BigNumber, ethers } from 'ethers';

const weightPrecision = 28;
const percentPrecision = 2;

export const percentToFixedWeight = (weight: number) =>
  parseFixed(`${weight}`, weightPrecision - percentPrecision);

export const _100_PERCENT_WEIGHT = percentToFixedWeight(100);

export const fixedWeightToPercent = (weight: BigNumber): number =>
  parseFloat(
    ethers.utils.formatUnits(weight, weightPrecision - percentPrecision),
  );
