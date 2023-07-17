import { Address, compareAddress } from '../address';
import { Selector, asSelector, compareBytes } from '../bytes';
import { TargetsConfigStruct } from '../contracts/TestVerifier';
import { HookSelector } from './selector';
import { AwaitedObj } from '../util';
import { newAbiType } from '../util/abi';
import { HookStruct } from './permissions';
import _ from 'lodash';
import { Operation } from '../operation';
import { OperationSatisfiability } from '../satisfiability';
import assert from 'assert';
import { getFunctionSelector, getAbiItem } from 'viem';
import { ERC20_ABI } from '../abi';

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
  (unoptimizedConfig) => {
    const c = optimize(unoptimizedConfig);

    return {
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
    };
  },
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

export const verifyTargetsPermission = (t: TargetsConfig, op: Operation): OperationSatisfiability =>
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
  if (!targets.contracts[to])
    targets.contracts[to] = { functions: {}, defaultAllow: targets.default.defaultAllow };

  targets.contracts[to].functions[selector] = allow;

  targets = optimize(targets);

  assert(isTargetAllowed(targets, to, selector) == allow);
};

const optimize = (targets: TargetsConfig): TargetsConfig => {
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
};

export const SPENDING_TRANSFER_FUNCTIONS = new Set<Selector>([
  getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'transfer' })) as Selector,
  getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'approve' })) as Selector,
  getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'increaseAllowance' })) as Selector,
  // decreaseAllowance is not currently factored into spending limits by hook contract
  getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'decreaseAllowance' })) as Selector,
]);
