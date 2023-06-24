import { Address, asAddress } from '../address';
import _ from 'lodash';
import { AwaitedObj, tryOrIgnore } from '../util';
import { newAbiType } from '../util/abi';
import { TransfersConfigStruct } from '../contracts/TestVerifier';
import { asBigInt } from '../bigint';
import { HookStruct } from './permissions';
import { HookSelector } from './selector';
import { Operation } from '../operation';
import { decodeFunctionData } from 'viem';
import { ERC20_ABI } from '../abi';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

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

export const TRANSFERS_CONFIG_ABI = newAbiType<TransfersConfig, AwaitedObj<TransfersConfigStruct>>(
  '((address token, uint224 amount, uint32 duration)[] limits, bool defaultAllow, uint32 budget)',
  (c) => ({
    limits: Object.entries(c.limits).map(([token, { amount, duration }]) => ({
      token,
      amount,
      duration,
    })),
    defaultAllow: c.defaultAllow ?? false,
    budget: c.budget ?? 0,
  }),
  (s) => ({
    limits: Object.fromEntries(
      s.limits.map(({ token, amount, duration }) => [
        asAddress(token),
        { amount: asBigInt(amount), duration: Number(asBigInt(duration)) },
      ]),
    ),
    defaultAllow: s.defaultAllow,
    budget: Number(asBigInt(s.budget)),
  }),
);

export const transfersConfigAsPermissionStruct = (c: TransfersConfig): HookStruct | undefined => {
  if (c.defaultAllow && !Object.entries(c.limits).length) return undefined;

  return {
    selector: HookSelector.Transfer,
    config: TRANSFERS_CONFIG_ABI.encode(c),
  };
};

export const hookAsTransfersConfig = (p: HookStruct | undefined) =>
  p ? TRANSFERS_CONFIG_ABI.decode(p.config) : ALLOW_ALL_TRANSFERS_CONFIG;

export const verifyTransfersPermission = (c: TransfersConfig, op: Operation) => {
  const transfer = decodeTransfer(op);
  if (!transfer.amount) return true;

  const limit = c.limits[transfer.token];
  if (!limit) return !!c.defaultAllow;

  // TODO: factor in spending that has already occured this epoch

  return transfer.amount <= limit.amount;
};

const decodeTransfer = (op: Operation) => {
  const r = tryOrIgnore(() =>
    decodeFunctionData({
      abi: ERC20_ABI,
      data: op.data ?? '0x',
    }),
  );

  return r?.functionName === 'transfer' ||
    r?.functionName === 'approve' ||
    r?.functionName === 'increaseAllowance'
    ? { token: op.to, to: r.args[0], amount: r.args[1] }
    : { token: ETH_ADDRESS as Address, to: op.to, amount: op.value };
};
