import { BytesLike, ethers } from 'ethers';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import {
  Approver,
  SafeApprover,
  toSafeApprover,
  toSafeApprovers,
} from './approver';
import { Safe } from './contracts';
import { createOp, Op } from './op';

export interface SafeGroup {
  id: BytesLike;
  approvers: SafeApprover[];
}

export interface Group {
  id: BytesLike;
  approvers: Approver[];
}

export type Groupish = Group | SafeGroup;

export const toSafeGroup = (group: Groupish): SafeGroup => ({
  id: group.id,
  approvers: toSafeApprovers(group.approvers),
});

export const abiEncodeGroup = (group: Groupish) => {
  const { approvers } = toSafeGroup(group);

  return ethers.utils.defaultAbiCoder.encode(
    ['tuple(address addr, uint96 weight)[]'],
    [approvers.map(toSafeApprover)],
  );
};

export const randomGroupId = () => hexlify(randomBytes(32));

export const createUpsertGroupOp = (safe: Safe, group: Groupish): Op =>
  createOp({
    to: safe.address,
    data: safe.interface.encodeFunctionData('upsertGroup', [
      group.id,
      toSafeApprovers(group.approvers),
    ]),
  });

export const createRemoveGroupOp = (safe: Safe, group: Groupish): Op =>
  createOp({
    to: safe.address,
    data: safe.interface.encodeFunctionData('removeGroup', [group.id]),
  });
