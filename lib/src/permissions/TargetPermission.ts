import { Address, Addresslike, ZERO_ADDR, asAddress, compareAddress } from '../address';
import { Selector, asSelector, compareBytes } from '../bytes';
import { TargetStruct } from '../contracts/TestVerifier';
import { PermissionSelector } from './PermissionSelector';
import { Arraylike, AwaitedObj, toArray } from '../util';
import { newAbiType } from '../util/abi';
import { Tx } from '../tx';
import { PermissionStruct } from './permissions';
import _ from 'lodash';
import { BytesLike } from 'ethers';

export type Target = Address | '*';
export type Targets = Record<Target, Set<Selector | '*'>>;

export type Targetlike = Addresslike | '*';
export type Targetslike =
  | Partial<Record<Targetlike, Arraylike<BytesLike | '*'>>>
  | { to: Targetlike; selectors: Arraylike<BytesLike | '*'> }[];

export const asTargets = (targets?: Targetslike): Targets => {
  if (!targets) return ALLOW_ALL_TARGETS;

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

export const ALLOW_ALL_TARGETS = {
  '*': new Set(['*'] as const),
} satisfies Targets;

export const TARGETS_ABI = newAbiType<Targets, AwaitedObj<TargetStruct>[] | undefined>(
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
  p ? TARGETS_ABI.decode(p.args) : ALLOW_ALL_TARGETS;

export const targetsAsPermission = (targets: Targets): PermissionStruct | undefined => {
  // There's no need for target permissions if they're allow all
  if (_.isEqual(targets, ALLOW_ALL_TARGETS)) return undefined;

  return {
    selector: PermissionSelector.Target,
    args: TARGETS_ABI.encode(targets),
  };
};

export const verifyTargetsPermission = (t: Targets, tx: Tx) => {
  const selectors = t[tx.to] ?? t[FALLBACK_ADDRESS];
  if (!selectors) return false;

  const selector = asSelector(tx.data);
  return !!selector && selectors.has(selector);
};
