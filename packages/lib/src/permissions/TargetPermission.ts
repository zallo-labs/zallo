import { Address, asAddress, compareAddress } from '../address';
import { Selector, asSelector } from '../bytes';
import { HookSelector } from './util';
import { HookStruct } from './permissions';
import _ from 'lodash';
import { Operation } from '../operation';
import { OperationSatisfiability } from '../satisfiability';
import assert from 'assert';
import { getAbiItem, encodeAbiParameters, decodeAbiParameters, hexToNumber } from 'viem';
import { AbiParameterToPrimitiveType } from 'abitype';
import { TEST_VERIFIER_ABI } from '../contract';

export interface TargetsConfig {
  contracts: Record<Address, Target>;
  default: Target;
}

export interface Target {
  functions: Record<Selector, boolean>;
  defaultAllow?: boolean;
}

export const ALLOW_ALL_TARGETS = {
  contracts: {},
  default: { functions: {}, defaultAllow: true },
} satisfies TargetsConfig;

const configAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'validateTarget' }).inputs[1];
export type TargetsConfigStruct = AbiParameterToPrimitiveType<typeof configAbi>;

export function encodeTargetsConfigStruct(c: TargetsConfig): TargetsConfigStruct {
  c = optimize(c);

  return {
    contracts: Object.entries(c.contracts)
      .map(([address, target]) => ({
        addr: asAddress(address),
        target: {
          functions: Object.entries(target.functions)
            .map(([selector, allow]) => ({
              selector: asSelector(selector),
              allow,
            }))
            .sort((a, b) => hexToNumber(a.selector) - hexToNumber(b.selector)),
          defaultAllow: !!target.defaultAllow,
        },
      }))
      .sort((a, b) => compareAddress(a.addr, b.addr)),
    defaultTarget: {
      functions: Object.entries(c.default.functions)
        .map(([selector, allow]) => ({
          selector: asSelector(selector),
          allow,
        }))
        .sort((a, b) => hexToNumber(a.selector) - hexToNumber(b.selector)),
      defaultAllow: !!c.default.defaultAllow,
    },
  };
}

export function decodeTargetsConfigStruct(s: TargetsConfigStruct): TargetsConfig {
  return {
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
      functions: Object.fromEntries(s.defaultTarget.functions.map((s) => [s.selector, s.allow])),
      defaultAllow: s.defaultTarget.defaultAllow,
    },
  };
}

export function encodeTargetsHook(targets: TargetsConfig): HookStruct | undefined {
  targets = optimize(targets);

  // There's no need for the hook if it allow all
  if (_.isEqual(targets, ALLOW_ALL_TARGETS)) return undefined;

  return {
    selector: HookSelector.Target,
    config: encodeAbiParameters([configAbi], [encodeTargetsConfigStruct(targets)]),
  };
}

export function decodeTargetsHook(h: HookStruct | undefined) {
  if (!h) return ALLOW_ALL_TARGETS;

  if (h.selector !== HookSelector.Target) throw new Error(`Unexpected selector "${h.selector}"`);

  return decodeTargetsConfigStruct(decodeAbiParameters([configAbi], h.config)[0]);
}

export function verifyTargetsPermission(t: TargetsConfig, op: Operation): OperationSatisfiability {
  return isTargetAllowed(t, op.to, asSelector(op.data))
    ? { result: 'satisfied' }
    : {
        result: 'unsatisfiable',
        reason: "Calling this function on this address isn't allowed",
      };
}

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
  if (!targets.contracts[to])
    targets.contracts[to] = { functions: {}, defaultAllow: targets.default.defaultAllow };

  targets.contracts[to].functions[selector] = allow;

  targets = optimize(targets);

  assert(isTargetAllowed(targets, to, selector) == allow);
};

function optimize(targets: TargetsConfig): TargetsConfig {
  // Remove selectors that match the contract default
  targets.contracts = _.mapValues(targets.contracts, (target) => ({
    ...target,
    functions: _.pickBy(target.functions, (allow) => allow !== target.defaultAllow),
  }));

  // Remove contracts without selectors that match the default
  targets.contracts = _.pickBy(
    targets.contracts,
    (target) =>
      Object.keys(target.functions).length > 0 ||
      target.defaultAllow !== targets.default.defaultAllow,
  );

  return targets;
}

export function replaceTargetsSelfAddress(
  targets: TargetsConfig,
  from: Address,
  to: Address,
): TargetsConfig {
  const selfTarget = targets.contracts[from];
  if (!selfTarget) return targets;

  return {
    ...targets,
    contracts: {
      ..._.omit(targets.contracts, from),
      [to]: selfTarget,
    },
  };
}
