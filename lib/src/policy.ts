import { A } from 'ts-toolbelt';
import { asUint16, MAX_UINT16, MIN_UINT16 } from './bigint';
import { BigNumber, BigNumberish } from 'ethers';
import { PolicyStruct as BasePolicyStruct } from './contracts/Account';
import { AwaitedObj } from './util/types';
import { Address, asAddress, compareAddress } from './address';
import {
  ALLOW_ALL_TRANSFERS_CONFIG,
  Permissions,
  permissionsAsHookStructs,
  structAsPermissions,
} from './permissions';
import { ALLOW_ALL_TARGETS } from './permissions/TargetPermission';
import { newAbiType } from './util/abi';
import { asHex } from './bytes';
import { keccak256 } from 'ethers/lib/utils';
import { Arraylike, toSet } from './util';

export type PolicyStruct = AwaitedObj<BasePolicyStruct>;

export type PolicyKey = A.Type<number, 'PolicyKey'>;
export const asPolicyKey = (key: BigNumberish) => asUint16(key) as unknown as PolicyKey;
export const MIN_POLICY_KEY = MIN_UINT16 as unknown as PolicyKey;
export const MAX_POLICY_KEY = MAX_UINT16 as unknown as PolicyKey;

export interface PolicyId {
  readonly account: Address;
  readonly key: PolicyKey;
}

export type UniquePolicy = PolicyId & Policy;

export interface Policy {
  readonly key: PolicyKey;
  permissions: Permissions;
  approvers: Set<Address>;
  threshold: number;
}

export const asPolicy = (p: {
  key: BigNumberish;
  permissions?: Partial<Permissions>;
  approvers: Arraylike<Address>;
  threshold?: number;
}): Policy => {
  const approvers = toSet(p.approvers);

  if (p.threshold !== undefined && p.threshold > approvers.size)
    throw new Error(`Policy threshold must be <= approvers`);

  return {
    key: asPolicyKey(p.key),
    approvers,
    threshold: p.threshold ?? approvers.size,
    permissions: {
      targets: p.permissions?.targets ?? ALLOW_ALL_TARGETS,
      transfers: p.permissions?.transfers ?? ALLOW_ALL_TRANSFERS_CONFIG,
    },
  };
};

export const POLICY_ABI = newAbiType<Policy, PolicyStruct>(
  `(uint32 key, uint8 threshold, address[] approvers, (uint8 selector, bytes config)[] hooks)`,
  (policy) => ({
    key: policy.key,
    approvers: [...policy.approvers].sort(compareAddress),
    threshold: policy.threshold,
    hooks: permissionsAsHookStructs(policy.permissions),
  }),
  (s) => ({
    key: asPolicyKey(s.key),
    approvers: new Set(s.approvers.map(asAddress)),
    threshold: BigNumber.from(s.threshold).toNumber(), // uint16
    permissions: structAsPermissions(s.hooks),
  }),
);

export const hashPolicy = (policy: Policy) => asHex(keccak256(POLICY_ABI.encode(policy)));
