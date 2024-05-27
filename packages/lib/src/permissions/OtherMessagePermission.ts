import { HookStruct } from './permissions';
import { HookSelector } from './util';
import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from 'viem';
import { MessagePermissionVerifier } from '../validation';
import { EXPOSED_ABI } from '../contract';

export interface OtherMessageConfig {
  allow: boolean;
}

export const ALLOW_OTHER_MESSAGES_CONFIG = {
  allow: true,
} satisfies OtherMessageConfig;

const configAbi = getAbiItem({ abi: EXPOSED_ABI, name: 'OtherMessageHook' }).inputs[0];

export function encodeOtherMessageHook(c: OtherMessageConfig): HookStruct | undefined {
  if (c.allow) return undefined;

  return {
    selector: HookSelector.OtherMessage,
    config: encodeAbiParameters([configAbi], [c]),
  };
}

export function decodeOtherMessageHook(h: HookStruct | undefined): OtherMessageConfig {
  if (!h) return ALLOW_OTHER_MESSAGES_CONFIG;

  if (h.selector !== HookSelector.OtherMessage)
    throw new Error(`Unexpected selector "${h.selector}"`);

  return decodeAbiParameters([configAbi], h.config)[0];
}

export function verifyOtherMessagePermission(
  c: OtherMessageConfig,
  previouslyHandled: boolean,
): MessagePermissionVerifier {
  if (previouslyHandled) return [false, true];

  return [true, c.allow || 'Arbitrary messages are not allowed'];
}
