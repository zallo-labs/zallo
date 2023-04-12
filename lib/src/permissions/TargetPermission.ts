import { Address, Addresslike, ZERO_ADDR, asAddress, compareAddress } from '../address';
import { Selector, asSelector, compareBytes } from '../bytes';
import { TargetStruct } from '../contracts/TestRules';
import { PermissionSelector } from './PermissionSelector';
import { Arraylike, AwaitedObj, toArray } from '../util';
import { newAbiType } from '../util/abi';
import { Tx } from '../tx';
import { PermissionStruct } from './permissions';
import _ from 'lodash';
import { BytesLike } from 'ethers';

export type TargetPermission = Record<Address | '*', Set<Selector | '*'>>;

export const asTargets = (
  entries?: { to: Addresslike | '*'; selectors: Arraylike<BytesLike | '*'> }[],
): TargetPermission =>
  entries
    ? {
        '*': new Set([]),
        ...Object.fromEntries(
          entries.map(({ to, selectors }) => [
            to === '*' ? to : asAddress(to),
            new Set(toArray(selectors).map((s) => (s === '*' ? s : asSelector(s)))),
          ]),
        ),
      }
    : DEFAULT_TARGETS;

const FALLBACK_ADDRESS = ZERO_ADDR;
const ANY_SELECTOR = '0x00000000' as Selector;

export const DEFAULT_TARGETS = {
  '*': new Set(['*'] as const),
} satisfies TargetPermission;

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
        [to === FALLBACK_ADDRESS ? '*' : to]: new Set(
          selectors.map((s) => {
            const selector = asSelector(s);
            return selector !== ANY_SELECTOR ? selector : '*';
          }),
        ),
      }),
      {
        '*': new Set([]),
      },
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
