import { HookStruct } from './permissions';
import { HookSelector } from './selector';
import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from 'viem';
import { MessagePermissionVerifier } from '../satisfiability';
import { AbiParameterToPrimitiveType } from 'abitype';
import { TEST_VERIFIER_ABI } from '../contract';

export interface OtherMessageConfig {
  allow: boolean;
}

export const ALLOW_OTHER_MESSAGES_CONFIG = {
  allow: true,
} satisfies OtherMessageConfig;

const configAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'validateOtherMessage' }).inputs[1];
export type OtherMessageConfigStruct = AbiParameterToPrimitiveType<typeof configAbi>;

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
  if (previouslyHandled) return [false, { result: 'satisfied' }];

  const r = c.allow
    ? ({ result: 'satisfied' } as const)
    : ({ result: 'unsatisfiable', reason: 'Arbitrary messages are not allowed' } as const);
  return [true, r];
}
