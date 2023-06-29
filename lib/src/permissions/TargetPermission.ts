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
  contracts: Record<Address, Target>;
  default: Target;
}

export interface Target {
  functions: Record<Selector, boolean>;
  defaultAllow: boolean;
}

export const ALLOW_ALL_TARGETS = {
  contracts: {},
  default: { functions: {}, defaultAllow: true },
} satisfies TargetsConfig;

const TARGET_ABI = '((bytes4 selector, bool allow)[] functions, bool defaultAllow)';

export const TARGETS_CONFIG_ABI = newAbiType<TargetsConfig, AwaitedObj<TargetsConfigStruct>>(
  `((address addr, ${TARGET_ABI} target)[] contracts, ${TARGET_ABI} defaultTarget)`,
  (c) => ({
    contracts: Object.entries(c.contracts)
      .map(([address, target]) => ({
        addr: address,
        target: {
          functions: Object.entries(target.functions)
            .map(([selector, allow]) => ({
              selector,
              allow,
            }))
            .sort((a, b) => compareBytes(a.selector, b.selector)),
          defaultAllow: target.defaultAllow,
        },
      }))
      .sort((a, b) => compareAddress(a.addr, b.addr)),
    defaultTarget: {
      functions: Object.entries(c.default.functions)
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
          contracts: Object.fromEntries(
            s.contracts.map((t) => [
              t.addr,
              {
                functions: Object.fromEntries(t.target.functions.map((s) => [s.selector, s.allow])),
                defaultAllow: t.target.defaultAllow,
              } satisfies Target,
            ]),
          ),
          default: {
            functions: Object.fromEntries(
              s.defaultTarget.functions.map((s) => [s.selector, s.allow]),
            ),
            defaultAllow: s.defaultTarget.defaultAllow,
          },
        }
      : ALLOW_ALL_TARGETS,
);

export const hookAsTargets = (p: HookStruct | undefined) =>
  p ? TARGETS_CONFIG_ABI.decode(p.config) : ALLOW_ALL_TARGETS;

export const targetsAsHook = (targets: TargetsConfig): HookStruct | undefined => {
  // There's no need for target permissions if they're allow all
  if (_.isEqual(targets, ALLOW_ALL_TARGETS)) return undefined;

  return {
    selector: HookSelector.Target,
    config: TARGETS_CONFIG_ABI.encode(targets),
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

  const target = targets.contracts[to];

  return target
    ? target.functions[selector] ?? target.defaultAllow
    : targets.default.functions[selector] ?? targets.default.defaultAllow;
};

export const setTargetAllowed = (
  targets: TargetsConfig,
  to: Address,
  selector: Selector,
  allow: boolean,
) => {
  // Naive
  targets.contracts[to].functions[selector] = allow;

  // Optimization - remove selector if matches the target default
  if (targets.contracts[to].defaultAllow === allow) {
    delete targets.contracts[to].functions[selector];
  }

  // Optimization - remove target if it matches the the default
  if (
    Object.keys(targets.contracts[to].functions).length === 0 &&
    targets.default.defaultAllow === allow &&
    (targets.default.functions[selector] === undefined ||
      targets.default.functions[selector] === allow)
  ) {
    delete targets.contracts[to];
  }

  assert(isTargetAllowed(targets, to, selector) == allow);
};
