import { A } from 'ts-toolbelt';
import { Address, asAddress, compareAddress, UAddress } from './address';
import {
  ALLOW_ALL_TRANSFERS_CONFIG,
  decodeTransfersHook,
  encodeTransfersHook,
  HookSelector,
  Permissions,
} from './permissions';
import {
  ALLOW_ALL_TARGETS,
  decodeTargetsHook,
  encodeTargetsHook,
} from './permissions/TargetPermission';
import { Hex } from './bytes';
import { Arraylike, isPresent, toSet } from './util';
import { decodeAbiParameters, encodeAbiParameters, getAbiItem, keccak256 } from 'viem';
import { ACCOUNT_IMPLEMENTATION } from './contract';
import { AbiParametersToPrimitiveTypes } from 'abitype';
import {
  ALLOW_OTHER_MESSAGES_CONFIG,
  decodeOtherMessageHook,
  encodeOtherMessageHook,
} from './permissions/OtherMessagePermission';

export type PolicyKey = A.Type<number, 'PolicyKey'>;
export const MIN_POLICY_KEY = 0;
export const MAX_POLICY_KEY = 2 ** 16 - 1;

export const asPolicyKey = (key: number) => {
  if (key < MIN_POLICY_KEY) throw new Error(`Key must be greater than minimum ${MIN_POLICY_KEY}`);
  if (key > MAX_POLICY_KEY) throw new Error(`Key must be less than maximum ${MAX_POLICY_KEY}`);
  return key as PolicyKey;
};

export interface PolicyId {
  readonly account: UAddress;
  readonly key: PolicyKey;
}

export interface Policy {
  readonly key: PolicyKey;
  permissions: Permissions;
  approvers: Set<Address>;
  threshold: number;
}

export const POLICY_STRUCT_ABI = getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'addPolicy' })
  .inputs[0];
export type PolicyStruct = AbiParametersToPrimitiveTypes<[typeof POLICY_STRUCT_ABI]>[0];

export function encodePolicyStruct(p: Policy): PolicyStruct {
  return {
    key: p.key,
    approvers: [...p.approvers].sort(compareAddress),
    threshold: p.threshold,
    hooks: [
      encodeTargetsHook(p.permissions.targets),
      encodeTransfersHook(p.permissions.transfers),
      encodeOtherMessageHook(p.permissions.otherMessage),
    ]
      .filter(isPresent)
      // Hooks must be sorted ascending by selector
      .sort((a, b) => a.selector - b.selector),
  };
}

export function decodePolicyStruct(s: PolicyStruct): Policy {
  return {
    key: asPolicyKey(s.key),
    approvers: new Set(s.approvers.map((a) => asAddress(a))),
    threshold: s.threshold,
    permissions: {
      targets: decodeTargetsHook(s.hooks.find((h) => h.selector === HookSelector.Target)),
      transfers: decodeTransfersHook(s.hooks.find((h) => h.selector === HookSelector.Transfer)),
      otherMessage: decodeOtherMessageHook(
        s.hooks.find((h) => h.selector === HookSelector.OtherMessage),
      ),
    },
  };
}

export function encodePolicy(p: Policy) {
  return encodeAbiParameters([POLICY_STRUCT_ABI], [encodePolicyStruct(p)]);
}

export function decodePolicy(encoded: Hex): Policy {
  return decodePolicyStruct(decodeAbiParameters([POLICY_STRUCT_ABI], encoded)[0]);
}

export function hashPolicy(policy: Policy) {
  return keccak256(encodePolicy(policy));
}

export const asPolicy = (p: {
  key: number;
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
      otherMessage: p.permissions?.otherMessage ?? ALLOW_OTHER_MESSAGES_CONFIG,
    },
  };
};
