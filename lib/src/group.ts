import { ethers } from 'ethers';
import { ApproverStruct } from './typechain/Safe';
import { compareAddresses } from './addr';
import { percentToFixedWeight } from './weight';

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
