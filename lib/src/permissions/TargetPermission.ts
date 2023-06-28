import { Address, compareAddress } from '../address';
import { Selector, asSelector, compareBytes } from '../bytes';
import { TargetsConfigStruct } from '../contracts/TestVerifier';
import { HookSelector } from './selector';
import { AwaitedObj } from '../util';
import { newAbiType } from '../util/abi';
import { HookStruct } from './permissions';
import _ from 'lodash';
import { Operation } from '../operation';
import { SatisfiabilityResult } from '../satisfiability';
import assert from 'assert';

export interface TargetsConfig {
  targets: Record<Address, Target>;
  default: Target;
}

export interface Target {
  selectors: Record<Selector, boolean>;
  defaultAllow: boolean;
}

export const ALLOW_ALL_TARGETS = {
  targets: {},
  default: { selectors: {}, defaultAllow: true },
} satisfies TargetsConfig;

const TARGET_ABI = '((bytes4 selector, bool allow)[] selectors, bool defaultAllow)';

export const TARGETS_ABI = newAbiType<TargetsConfig, AwaitedObj<TargetsConfigStruct> | undefined>(
  `((address targetAddress, ${TARGET_ABI} target)[] targets, ${TARGET_ABI} defaultTarget)`,
  (c) => ({
    targets: Object.entries(c.targets)
      .map(([address, target]) => ({
        targetAddress: address,
        target: {
          selectors: Object.entries(target.selectors)
            .map(([selector, allow]) => ({
              selector,
              allow,
            }))
            .sort((a, b) => compareBytes(a.selector, b.selector)),
          defaultAllow: target.defaultAllow,
        },
      }))
      .sort((a, b) => compareAddress(a.targetAddress, b.targetAddress)),
    defaultTarget: {
      selectors: Object.entries(c.default.selectors)
        .map(([selector, allow]) => ({
          selector,
          allow,
        }))
        .sort((a, b) => compareBytes(a.selector, b.selector)),
      defaultAllow: c.default.defaultAllow,
    },
  }),
  (s) =>
    s
      ? {
          targets: Object.fromEntries(
            s.targets.map((t) => [
              t.targetAddress,
              {
                selectors: Object.fromEntries(t.target.selectors.map((s) => [s.selector, s.allow])),
                defaultAllow: t.target.defaultAllow,
              } satisfies Target,
            ]),
          ),
          default: {
            selectors: Object.fromEntries(
              s.defaultTarget.selectors.map((s) => [s.selector, s.allow]),
            ),
            defaultAllow: s.defaultTarget.defaultAllow,
          },
        }
      : ALLOW_ALL_TARGETS,
);

export const hookAsTargets = (p: HookStruct | undefined) =>
  p ? TARGETS_ABI.decode(p.config) : ALLOW_ALL_TARGETS;

export const targetsAsHook = (targets: TargetsConfig): HookStruct | undefined => {
  // There's no need for target permissions if they're allow all
  if (_.isEqual(targets, ALLOW_ALL_TARGETS)) return undefined;

  return {
    selector: HookSelector.Target,
    config: TARGETS_ABI.encode(targets),
  };
};

export const verifyTargetsPermission = (t: TargetsConfig, op: Operation): SatisfiabilityResult =>
  isTargetAllowed(t, op.to, asSelector(op.data))
    ? { result: 'satisfied' }
    : {
        result: 'unsatisfiable',
        reason: "Calling this function on this address isn't allowed",
      };

export const isTargetAllowed = (
  targets: TargetsConfig,
  to: Address,
  selector: Selector | undefined,
) => {
  if (!selector) return true;

  const target = targets.targets[to];

  return target
    ? target.selectors[selector] ?? target.defaultAllow
    : targets.default.selectors[selector] ?? targets.default.defaultAllow;
};

export const setTargetAllowed = (
  targets: TargetsConfig,
  to: Address,
  selector: Selector,
  allow: boolean,
) => {
  // Naive
  targets.targets[to].selectors[selector] = allow;

  // Optimization - remove selector if matches the target default
  if (targets.targets[to].defaultAllow === allow) {
    delete targets.targets[to].selectors[selector];
  }

  // Optimization - remove target if it matches the the default
  if (
    Object.keys(targets.targets[to].selectors).length === 0 &&
    targets.default.defaultAllow === allow &&
    (targets.default.selectors[selector] === undefined ||
      targets.default.selectors[selector] === allow)
  ) {
    delete targets.targets[to];
  }

  assert(isTargetAllowed(targets, to, selector) == allow);
};
