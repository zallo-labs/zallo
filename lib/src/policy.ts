import { A } from 'ts-toolbelt';
import { asUint32, BigIntlike, MAX_UINT32, MIN_UINT32 } from './bigint';
import { BigNumber } from 'ethers';
import { PolicyStruct as BasePolicyStruct } from './contracts/Account';
import { AwaitedObj } from './util/types';
import { Address, asAddress, compareAddress } from './address';
import { Tx } from './tx';
import { Permissions, permissionsAsStruct, structAsPermissions } from './permissions';
import { DEFAULT_TARGETS, verifyTargetsPermission } from './permissions/TargetPermission';
import { newAbiType } from './util/abi';
import { asHex } from './bytes';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import { Arraylike, toSet } from './util';
import _ from 'lodash';

export type PolicyStruct = AwaitedObj<BasePolicyStruct>;

export type PolicyKey = A.Type<bigint, 'PolicyKey'>;
export const asPolicyKey = (key: BigIntlike) => asUint32(key) as unknown as PolicyKey;
export const MIN_POLICY_KEY = MIN_UINT32 as unknown as PolicyKey;
export const MAX_POLICY_KEY = MAX_UINT32 as unknown as PolicyKey;

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

export const asPolicy = (
  p: Partial<Omit<Policy, 'key' | 'approvers'>> & {
    key: BigIntlike;
    approvers: Arraylike<Address>;
  },
): Policy => {
  const approvers = toSet(p.approvers);

  if (p.threshold !== undefined && p.threshold > approvers.size)
    throw new Error(`Policy threshold must be greater than approvers`);

  return {
    permissions: {
      targets: DEFAULT_TARGETS,
    },
    threshold: approvers.size,
    ...p,
    key: asPolicyKey(p.key),
    approvers,
  };
};

export const POLICY_ABI = newAbiType<Policy, PolicyStruct>(
  `(uint32 key, uint8 threshold, address[] approvers, (uint8 selector, bytes args)[] permissions)`,
  (policy) => ({
    key: policy.key,
    permissions: permissionsAsStruct(policy.permissions),
    approvers: [...policy.approvers].sort(compareAddress),
    threshold: policy.threshold,
  }),
  (s) => ({
    key: asPolicyKey(s.key),
    approvers: new Set(s.approvers.map(asAddress)),
    threshold: BigNumber.from(s.threshold).toNumber(), // uint16
    permissions: structAsPermissions(s.permissions),
  }),
);

export const hashPolicy = (policy: Policy) => asHex(keccak256(POLICY_ABI.encode(policy)));

export enum PolicySatisfiability {
  Unsatisifable = 'unsatisfiable',
  Satisfiable = 'satisfiable',
  Satisfied = 'satisfied',
}

export const getTransactionSatisfiability = (
  { permissions, approvers, threshold }: Policy,
  tx: Tx,
  approvals: Set<Address>,
): PolicySatisfiability => {
  const isSatisfiable = verifyTargetsPermission(permissions.targets, tx);
  if (!isSatisfiable) return PolicySatisfiability.Unsatisifable;

  const nApprovals = new Set([...approvals].filter((v) => approvers.has(v)));
  return nApprovals.size >= threshold
    ? PolicySatisfiability.Satisfied
    : PolicySatisfiability.Satisfiable;
};
