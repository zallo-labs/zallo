import { Address, asAddress } from '../address';
import _ from 'lodash';
import { AwaitedObj } from '../util';
import { newAbiType } from '../util/abi';
import { TransfersConfigStruct } from '../contracts/TestVerifier';
import { asBigInt } from '../bigint';
import { PermissionStruct } from './permissions';
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

export const transfersConfigAsPermissionStruct = (
  c: TransfersConfig,
): PermissionStruct | undefined => {
  if (c.defaultAllow && !Object.entries(c.limits).length) return undefined;

  return {
    selector: HookSelector.Transfer,
    config: TRANSFERS_CONFIG_ABI.encode(c),
  };
};

export const permissionAsTransfersConfig = (p: PermissionStruct | undefined) =>
  p ? TRANSFERS_CONFIG_ABI.decode(p.config) : ALLOW_ALL_TRANSFERS_CONFIG;
