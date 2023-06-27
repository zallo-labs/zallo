import { Address, Addresslike, ZERO_ADDR, asAddress, compareAddress } from '../address';
import { Selector, asSelector, compareBytes } from '../bytes';
import { TargetStruct } from '../contracts/TestVerifier';
import { HookSelector } from './selector';
import { Arraylike, AwaitedObj, toArray } from '../util';
import { newAbiType } from '../util/abi';
import { HookStruct } from './permissions';
import _ from 'lodash';
import { BytesLike } from 'ethers';
import { Operation } from '../operation';
import { SatisfiabilityResult } from '../satisfiability';
import assert from 'assert';

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

export const hookAsTargets = (p: HookStruct | undefined) =>
  p ? TARGETS_ABI.decode(p.config) : ALLOW_ALL_TARGETS;

export const targetsAsHook = (targets: Targets): HookStruct | undefined => {
  // There's no need for target permissions if they're allow all
  if (_.isEqual(targets, ALLOW_ALL_TARGETS)) return undefined;

  return {
    selector: HookSelector.Target,
    config: TARGETS_ABI.encode(targets),
  };
};

export const verifyTargetsPermission = (t: Targets, op: Operation): SatisfiabilityResult => {
  const selectors = t[op.to] ?? t['*'];

  return selectors?.has('*') || selectors?.has(asSelector(op.data)!)
    ? { result: 'satisfied' }
    : {
        result: 'unsatisfiable',
        reason:
          selectors.size === 0
            ? "Calling this address isn't allowed"
            : "Calling this function on this address isn't allowed",
      };
};

export const isTargetAllowed = (targets: Targets, to: Address, selector: Selector) => {
  const target = targets[to];

  return target
    ? target?.has(selector) || target?.has(selector)
    : targets['*'].has(selector) || targets['*'].has('*');
};

export const setTargetAllowed = (
  targets: Targets,
  to: Address,
  selector: Selector,
  allow: boolean,
) => {
  const target = targets[to] ?? (targets[to] = new Set([]));

  if (allow) {
    target.add(selector);
  } else {
    target.delete(selector);
  }

  assert(isTargetAllowed(targets, to, selector) == allow);
};
