import { Address, ZERO_ADDR, asAddress, compareAddress } from '../address';
import { Selector, asSelector, compareBytes } from '../bytes';
import { TargetStruct } from '../contracts/TestRules';
import { PermissionSelector } from './PermissionSelector';
import { AwaitedObj } from '../util';
import { newAbiType } from '../util/abi';
import { Tx } from '../tx';
import { PermissionStruct } from './permissions';
import _ from 'lodash';

export type TargetPermission = Record<Address, Set<Selector>>;

export const FALLBACK_ADDRESS = ZERO_ADDR;
export const ANY_SELECTOR = '0x00000000' as Selector;

export const DEFAULT_TARGETS: TargetPermission = {
  [FALLBACK_ADDRESS]: new Set([ANY_SELECTOR]),
};

export const TARGET_PERMISSION_ABI = newAbiType<
  TargetPermission,
  AwaitedObj<TargetStruct>[] | undefined
>(
  '(address to, bytes4[] selectors)[]',
  (targets) =>
    Object.entries(targets)
      .map(
        ([address, selectors]): AwaitedObj<TargetStruct> => ({
          to: asAddress(address),
          selectors: [...selectors].sort(compareBytes),
        }),
      )
      .sort((a, b) => compareAddress(a.to, b.to)),
  (targetStructs) =>
    (targetStructs ?? []).reduce(
      (acc, { to, selectors }) => ({
        ...acc,
        [to]: new Set(selectors.map(asSelector)),
      }),
      {},
    ),
);

export const permissionAsTargets = (p: PermissionStruct | undefined) =>
  p ? TARGET_PERMISSION_ABI.decode(p.args) : DEFAULT_TARGETS;

export const targetsAsPermission = (targets: TargetPermission): PermissionStruct | undefined =>
  !_.isEqual(targets, DEFAULT_TARGETS)
    ? {
        selector: PermissionSelector.Target,
        args: TARGET_PERMISSION_ABI.encode(targets),
      }
    : undefined;

export const verifyTargetsPermission = (t: TargetPermission, tx: Tx) => {
  const selectors = t[tx.to] ?? t[FALLBACK_ADDRESS];
  if (!selectors) return false;

  const selector = asSelector(tx.data);
  return !!selector && selectors.has(selector);
};
