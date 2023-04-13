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

export type Target = Address | '*';
export type TargetPermission = Record<Target, Set<Selector | '*'>>;

export type Targetlike = Addresslike | '*';
export type Targetslike =
  | Partial<Record<Targetlike, Arraylike<BytesLike | '*'>>>
  | { to: Targetlike; selectors: Arraylike<BytesLike | '*'> }[];

export const asTargets = (targets?: Targetslike): TargetPermission => {
  if (!targets) return DEFAULT_TARGETS;

  const entries: { to: Targetlike; selectors: Arraylike<BytesLike | '*'> }[] = Array.isArray(
    targets,
  )
    ? targets
    : Object.entries(targets).map(([to, selectors]) => ({
        to,
        selectors: selectors ?? [],
      }));

  return {
    '*': new Set([]),
    ...Object.fromEntries(
      entries.map(({ to, selectors }) => [
        to === '*' || to === FALLBACK_ADDRESS ? '*' : asAddress(to),
        new Set(
          toArray(selectors).map((s) => (s === '*' || s === ANY_SELECTOR ? s : asSelector(s))),
        ),
      ]),
    ),
  };
};

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
      .map(([target, selectors]): AwaitedObj<TargetStruct> => {
        return {
          to: target === '*' ? FALLBACK_ADDRESS : asAddress(target),
          selectors: [...selectors].map((s) => (s === '*' ? ANY_SELECTOR : s)).sort(compareBytes),
        };
      })
      // Remove fallback target without selectors; it is equivalent to having no fallback
      .filter(({ to, selectors }) => to !== FALLBACK_ADDRESS || selectors.length > 0)
      .sort((a, b) => compareAddress(a.to, b.to)),
  (targetStructs) => asTargets(targetStructs),
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
