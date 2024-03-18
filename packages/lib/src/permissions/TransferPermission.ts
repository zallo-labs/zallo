import { Address, ETH_ADDRESS, asAddress } from '../address';
import { tryOrIgnore } from '../util';
import { HookStruct } from './permissions';
import { HookSelector } from './util';
import { Operation } from '../operation';
import {
  decodeAbiParameters,
  decodeFunctionData,
  encodeAbiParameters,
  getAbiItem,
  hexToNumber,
  toFunctionSelector,
} from 'viem';
import { ERC20 } from '../dapps';
import { PermissionValidation } from '../validation';
import { AbiParameterToPrimitiveType } from 'abitype';
import { TEST_VERIFIER_ABI } from '../contract';
import { Selector, asSelector } from '../bytes';

export interface TransferLimit {
  amount: bigint;
  duration: number; // seconds
}

export type TokenTransferLimits = Record<Address, TransferLimit>;

export interface TransfersConfig {
  limits: Record<Address, TransferLimit>;
  defaultAllow?: boolean;
  budget?: number;
}

export const ALLOW_ALL_TRANSFERS_CONFIG = {
  limits: {},
  defaultAllow: true,
} satisfies TransfersConfig;

const configAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'beforeExecuteTransfer' }).inputs[1];
export type TransfersConfigStruct = AbiParameterToPrimitiveType<typeof configAbi>;

export function encodeTransfersConfigStruct(c: TransfersConfig): TransfersConfigStruct {
  return {
    limits: Object.entries(c.limits)
      .map(([token, { amount, duration }]) => ({
        token: asAddress(token),
        amount,
        duration,
      }))
      .sort((a, b) => hexToNumber(a.token) - hexToNumber(b.token)),
    defaultAllow: c.defaultAllow ?? false,
    budget: c.budget ?? 0,
  };
}

export function decodeTransfersConfigStruct(s: TransfersConfigStruct): TransfersConfig {
  return {
    limits: Object.fromEntries(
      s.limits.map(({ token, amount, duration }) => [
        asAddress(token),
        { amount: amount, duration },
      ]),
    ),
    defaultAllow: s.defaultAllow,
    budget: s.budget,
  };
}

export function encodeTransfersHook(c: TransfersConfig): HookStruct | undefined {
  if (c.defaultAllow && !Object.entries(c.limits).length) return undefined;

  return {
    selector: HookSelector.Transfer,
    config: encodeAbiParameters([configAbi], [encodeTransfersConfigStruct(c)]),
  };
}

export function decodeTransfersHook(h: HookStruct | undefined): TransfersConfig {
  if (!h) return ALLOW_ALL_TRANSFERS_CONFIG;

  if (h.selector !== HookSelector.Transfer) throw new Error(`Unexpected selector "${h.selector}"`);

  return decodeTransfersConfigStruct(decodeAbiParameters([configAbi], h.config)[0]);
}

export function verifyTransfersPermission(c: TransfersConfig, op: Operation): PermissionValidation {
  const transfer = decodeTransfer(op);
  if (!transfer) return true;

  const limit = c.limits[transfer.token];
  if (!limit) return c.defaultAllow || "Transfers without a limit aren't allowed";

  return transfer.amount <= limit.amount || 'Above transfer limit';
}

export function decodeTransfer(op: Operation) {
  const r = tryOrIgnore(() => decodeFunctionData({ abi: ERC20, data: op.data ?? '0x' }));

  return r?.functionName === 'transfer' ||
    r?.functionName === 'approve' ||
    r?.functionName === 'increaseAllowance'
    ? { token: op.to, to: r.args[0], amount: r.args[1] }
    : op.value
      ? { token: ETH_ADDRESS, to: op.to, amount: op.value }
      : undefined;
}

export const TRANSFER_SELECTORS = [
  asSelector(toFunctionSelector(getAbiItem({ abi: ERC20, name: 'transfer' }))),
  asSelector(toFunctionSelector(getAbiItem({ abi: ERC20, name: 'approve' }))),
  asSelector(toFunctionSelector(getAbiItem({ abi: ERC20, name: 'increaseAllowance' }))),
] satisfies Selector[];
