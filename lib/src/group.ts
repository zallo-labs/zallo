import { ethers } from 'ethers';
import { parseFixed, BigNumber } from '@ethersproject/bignumber';
import { ApproverStruct } from './typechain/Safe';

export type Approver = ApproverStruct;
export type Group = Approver[];

export const getGroupId = (safeId: string, group: Approver[]): string =>
  `${safeId}-${getGroupHash(group)}`;

export const getGroupHash = (group: Approver[]): string =>
  ethers.utils.keccak256(abiEncodeGroup(group));

export const abiEncodeGroup = (group: Approver[]) =>
  ethers.utils.defaultAbiCoder.encode(['tuple(address addr, uint96 weight)[]'], [group]);

/* Weight */
export const WEIGHT_PRECISION = 28;
export const percentToFixedWeight = (weight: number) =>
  parseFixed(`${weight}`, WEIGHT_PRECISION - 2);

export const _100_PERCENT_WEIGHT = percentToFixedWeight(100);

export const fixedWeightToPercent = (weight: BigNumber): number =>
  weight.div(_100_PERCENT_WEIGHT.div(100)).toNumber();
