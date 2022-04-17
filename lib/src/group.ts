import { ethers } from 'ethers';
import { parseFixed, BigNumber } from '@ethersproject/bignumber';
import { ApproverStruct } from './typechain/Safe';
import { compareAddresses } from './addr';

export type Approver = ApproverStruct;
export type Group = Approver[];

export const toGroup = (...approvers: [string, number][]): Group =>
  approvers
    .map(([addr, weight]) => ({
      addr,
      weight: percentToFixedWeight(weight),
    }))
    .sort((a, b) => compareAddresses(a.addr, b.addr));

export const getGroupId = (safeId: string, group: Approver[]): string =>
  `${safeId}-${hashGroup(group)}`;

export const hashGroup = (group: Approver[]): string =>
  ethers.utils.keccak256(abiEncodeGroup(group));

export const abiEncodeGroup = (group: Approver[]) =>
  ethers.utils.defaultAbiCoder.encode(
    ['tuple(address addr, uint96 weight)[]'],
    [group],
  );

/* Weight */
const weightPrecision = 28;
const percentPrecision = 2;

export const percentToFixedWeight = (weight: number) =>
  parseFixed(`${weight}`, weightPrecision - percentPrecision);

export const _100_PERCENT_WEIGHT = percentToFixedWeight(100);

export const fixedWeightToPercent = (weight: BigNumber): number =>
  weight.div(_100_PERCENT_WEIGHT.div(10 ** percentPrecision)).toNumber();
