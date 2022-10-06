import { SignClientTypes, SessionTypes } from '@walletconnect/types';

export type WcEventParams = SignClientTypes.EventArguments;
export type WcSession = SessionTypes.Struct;

export interface WcSessionRequesst {
  request: WcEventParams['session_request'];
  session: WcSession;
}

type SetKeys<S extends Set<unknown>> = S extends Set<infer T> ? T : never;

export const WC_SIGNING_METHODS = new Set([
  'personal_sign',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
] as const);
export type WcSigningMethod = SetKeys<typeof WC_SIGNING_METHODS>;

export const WC_TRANSACTION_METHODS = new Set([
  'eth_signTransaction',
  'eth_sendTransaction',
  // 'eth_sendRawTransaction',
] as const);
export type WcTransactionMethod = SetKeys<typeof WC_TRANSACTION_METHODS>;

export const WC_METHODS = new Set([
  ...WC_SIGNING_METHODS,
  ...WC_TRANSACTION_METHODS,
] as const);
export type WcMethod = SetKeys<typeof WC_METHODS>;
