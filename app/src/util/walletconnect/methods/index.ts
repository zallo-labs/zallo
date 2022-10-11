import { SignClientTypes, SessionTypes } from '@walletconnect/types';
import { WC_SIGNING_METHODS } from './signing';
import { WC_TRANSACTION_METHODS } from './transaction';

export type WcEventParams = SignClientTypes.EventArguments;
export type WcSession = SessionTypes.Struct;

export interface WcSessionRequesst {
  request: WcEventParams['session_request'];
  session: WcSession;
}

const WC_METHODS_ARRAY = [
  ...WC_SIGNING_METHODS,
  ...WC_TRANSACTION_METHODS,
] as const;

export const WC_METHODS = new Set<string>(WC_METHODS_ARRAY);
export type WcMethod = typeof WC_METHODS_ARRAY[number];
