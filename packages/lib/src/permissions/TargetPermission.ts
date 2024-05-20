import { Address, asAddress } from '../address';
import { Selector, asSelector } from '../bytes';
import { HookSelector } from './util';
import { HookStruct } from './permissions';
import _ from 'lodash';
import { Operation } from '../operation';
import { PermissionValidation } from '../validation';
import { getAbiItem, encodeAbiParameters, decodeAbiParameters, hexToNumber } from 'viem';
import { AbiParameterToPrimitiveType } from 'abitype';
import { EXPOSED_ABI } from '../contract';

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

const configAbi = getAbiItem({ abi: EXPOSED_ABI, name: 'TargetHook' }).inputs[0];
export type TargetsConfigStruct = AbiParameterToPrimitiveType<typeof configAbi>;

export function encodeTargetsConfigStruct(c: TargetsConfig): TargetsConfigStruct {
  c = optimize(c);

  return {
    contracts: Object.entries(c.contracts)
      .map(([address, target]) => ({
        addr: asAddress(address),
        allow: !!target.defaultAllow,
        excludedSelectors: getExcludedSelectors(target.defaultAllow, target.functions),
      }))
      .sort((a, b) => hexToNumber(a.addr) - hexToNumber(b.addr)),
    defaultAllow: !!c.default.defaultAllow,
    defaultExcludedSelectors: getExcludedSelectors(c.default.defaultAllow, c.default.functions),
  };
}

function getExcludedSelectors(
  allow: boolean | undefined,
  functions: Record<Selector, boolean>,
): Selector[] {
  return Object.entries(functions)
    .map(([selector, allow]) => ({
      selector: asSelector(selector),
      allow,
    }))
    .filter((v) => v.allow !== !!allow)
    .map((v) => v.selector)
    .sort((a, b) => hexToNumber(a) - hexToNumber(b));
}

export function decodeTargetsConfigStruct(s: TargetsConfigStruct): TargetsConfig {
  return {
    contracts: Object.fromEntries(
      s.contracts.map((t) => [
        t.addr,
        {
          functions: Object.fromEntries(
            t.excludedSelectors.map((selector) => [selector, !t.allow]),
          ),
          defaultAllow: t.allow,
        } satisfies Target,
      ]),
    ),
    default: {
      functions: Object.fromEntries(
        s.defaultExcludedSelectors.map((selector) => [selector, !s.defaultAllow]),
      ),
      defaultAllow: s.defaultAllow,
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

export function verifyTargetsPermission(t: TargetsConfig, op: Operation): PermissionValidation {
  return (
    isTargetAllowed(t, op.to, asSelector(op.data)) ||
    "Calling this function on this address isn't allowed"
  );
}

function isTargetAllowed(targets: TargetsConfig, to: Address, selector: Selector | undefined) {
  if (!selector) return true;

  const target = targets.contracts[to];

  return target
    ? target.functions[selector] ?? target.defaultAllow
    : targets.default.functions[selector] ?? targets.default.defaultAllow;
}

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

  // Remove fallback functions that match the fallback default
  targets.default.functions = _.pickBy(
    targets.default.functions,
    (allow) => allow !== targets.default.defaultAllow,
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
