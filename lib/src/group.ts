import { BigNumberish, ethers } from 'ethers';
import { ApproverStruct } from './typechain/Safe';
import { Address, compareAddresses } from './addr';
import { percentToFixedWeight } from './weight';
import { toId } from './id';

export interface SafeApprover extends ApproverStruct {
  addr: Address;
  weight: BigNumberish;
}

export interface Approver {
  addr: Address;
  weight: number;
}

export type Approverish = SafeApprover | Approver;

export const toSafeApprover = (approver: Approverish): SafeApprover => ({
  addr: approver.addr,
  weight:
    typeof approver.weight === 'number'
      ? percentToFixedWeight(approver.weight)
      : approver.weight,
});

export interface SafeGroup {
  approvers: SafeApprover[];
}

export interface Group {
  approvers: Approver[];
}

export type Groupish = Group | SafeGroup;

export const toGroupStruct = (group: Groupish): SafeGroup => ({
  approvers: group.approvers
    .map(toSafeApprover)
    .sort((a, b) => compareAddresses(a.addr, b.addr)),
});

export const getGroupId = (safeId: string, group: Groupish): string =>
  toId(`${safeId}-${hashGroup(group)}`);

export const hashGroup = (group: Groupish): string =>
  ethers.utils.keccak256(abiEncodeGroup(group));

export const abiEncodeGroup = (group: Groupish) => {
  const { approvers } = toGroupStruct(group);

  return ethers.utils.defaultAbiCoder.encode(
    ['tuple(address addr, uint96 weight)[]'],
    [approvers.map(toSafeApprover)],
  );
};
