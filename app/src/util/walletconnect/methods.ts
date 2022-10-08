import { SignClientTypes, SessionTypes } from '@walletconnect/types';
import { SetKeys } from 'lib';
import { WC_SIGNING_METHODS } from './signingMethods';

export type WcEventParams = SignClientTypes.EventArguments;
export type WcSession = SessionTypes.Struct;

export interface WcSessionRequesst {
  request: WcEventParams['session_request'];
  session: WcSession;
}

export const WC_TRANSACTION_METHODS = new Set([
  'eth_signTransaction',
  'eth_sendTransaction',
] as const);
export type WcTransactionMethod = SetKeys<typeof WC_TRANSACTION_METHODS>;

export const WC_METHODS = new Set([
  ...WC_SIGNING_METHODS,
  ...WC_TRANSACTION_METHODS,
] as const);
export type WcMethod = SetKeys<typeof WC_METHODS>;
