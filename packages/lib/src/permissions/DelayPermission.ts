import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from 'viem';
import { TEST_VERIFIER_ABI } from '../contract';
import { HookSelector } from './util';
import { HookStruct } from './permissions';

export type DelayConfig = number; /* seconds */

export const NO_DELAY_CONFIG: DelayConfig = 0;

const configAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'beforeExecuteDelay' }).inputs[1];

export function encodeDelayHook(delay: DelayConfig): HookStruct | undefined {
  if (delay === 0) return undefined;

  return {
    selector: HookSelector.Delay,
    config: encodeAbiParameters([configAbi], [{ delay }]),
  };
}

export function decodeDelayHook(h: HookStruct | undefined): DelayConfig {
  if (!h) return NO_DELAY_CONFIG;

  if (h.selector !== HookSelector.Delay) throw new Error(`Unexpected selector "${h.selector}"`);

  return Number(decodeAbiParameters([configAbi], h.config)[0].delay);
}
