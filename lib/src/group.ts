import { BytesLike, ethers } from 'ethers';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { isEqual } from 'lodash';
import {
  Approver,
  SafeApprover,
  toSafeApprover,
  toSafeApprovers,
} from './approver';
import { Safe } from './contracts';
import { Id, toId } from './id';
import { createOp, Op } from './op';

export interface SafeGroup {
  ref: BytesLike;
  approvers: SafeApprover[];
}

export interface Group {
  ref: BytesLike;
  approvers: Approver[];
}

export type Groupish = Group | SafeGroup;

export const toSafeGroup = (group: Groupish): SafeGroup => ({
  ref: group.ref,
  approvers: toSafeApprovers(group.approvers),
});

export const abiEncodeGroup = (group: Groupish) => {
  const { approvers } = toSafeGroup(group);

  return ethers.utils.defaultAbiCoder.encode(
    ['tuple(address addr, uint96 weight)[]'],
    [approvers.map(toSafeApprover)],
  );
};

export const randomGroupRef = () => hexlify(randomBytes(32));

export const getGroupId = (safe: string, groupRef: BytesLike): Id =>
  toId(`${safe}-${hexlify(groupRef)}`);

export const createUpsertGroupOp = (safe: Safe, group: Groupish): Op =>
  createOp({
    to: safe.address,
    data: safe.interface.encodeFunctionData('upsertGroup', [
      group.ref,
      toSafeApprovers(group.approvers),
    ]),
  });

export const createRemoveGroupOp = (safe: Safe, group: Groupish): Op =>
  createOp({
    to: safe.address,
    data: safe.interface.encodeFunctionData('removeGroup', [group.ref]),
  });

export const groupEquiv = (
  aGroupish: Groupish,
  bGroupish: Groupish,
): boolean => {
  const a = toSafeGroup(aGroupish);
  const b = toSafeGroup(bGroupish);

  return isEqual(a.approvers, b.approvers);
};
