import { SignClientTypes } from '@walletconnect/types';
import { WC_SIGNING_METHODS } from './signing';
import { WC_TRANSACTION_METHODS } from './transaction';

export type WcEventParams = SignClientTypes.EventArguments;

export const WC_METHODS = new Set([...WC_SIGNING_METHODS, ...WC_TRANSACTION_METHODS]);
