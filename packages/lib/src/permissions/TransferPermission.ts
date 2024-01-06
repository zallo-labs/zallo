import { AbiParameterToPrimitiveType } from 'abitype';
import { decodeAbiParameters, decodeFunctionData, encodeAbiParameters, getAbiItem } from 'viem';

import { Address, asAddress, ETH_ADDRESS } from '../address';
import { TEST_VERIFIER_ABI } from '../contract';
import { ERC20 } from '../dapps';
import { Operation } from '../operation';
import { OperationSatisfiability } from '../satisfiability';
import { tryOrIgnore } from '../util';
import { HookStruct } from './permissions';
import { HookSelector } from './selector';

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
    limits: Object.entries(c.limits).map(([token, { amount, duration }]) => ({
      token: asAddress(token),
      amount,
      duration,
    })),
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

export function verifyTransfersPermission(
  c: TransfersConfig,
  op: Operation,
): OperationSatisfiability {
  const transfer = decodeTransfer(op);
  if (!transfer.amount) return { result: 'satisfied' };

  const limit = c.limits[transfer.token];
  if (!limit)
    return c.defaultAllow
      ? { result: 'satisfied' }
      : { result: 'unsatisfiable', reason: "Transfers without a limit aren't allowed" };

  // TODO: factor in spending that has already occured this epoch

  return transfer.amount <= limit.amount
    ? { result: 'satisfied' }
    : { result: 'unsatisfiable', reason: 'Above transfer limit' };
}

function decodeTransfer(op: Operation) {
  const r = tryOrIgnore(() => decodeFunctionData({ abi: ERC20, data: op.data ?? '0x' }));

  return r?.functionName === 'transfer' ||
    r?.functionName === 'approve' ||
    r?.functionName === 'increaseAllowance'
    ? { token: op.to, to: r.args[0], amount: r.args[1] }
    : { token: ETH_ADDRESS, to: op.to, amount: op.value };
}
