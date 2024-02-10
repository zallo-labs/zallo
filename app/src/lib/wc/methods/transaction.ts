import { Address, Hex } from 'lib';
import { SignClientTypes } from '@walletconnect/types';

export interface WcTransactionRequest {
  from: Address;
  to: Address;
  value?: number | string;
  data?: Hex;
  gasLimit?: number | string;
}

interface WcSendTransactionRequest {
  method: 'eth_sendTransaction';
  params: [tx: WcTransactionRequest];
}

const WC_TRANSACTION_METHODS_ARRAY = [
  // 'eth_signTransaction',
  'eth_sendTransaction',
] as const;

export const WC_TRANSACTION_METHODS = new Set(WC_TRANSACTION_METHODS_ARRAY);

// Assert that WC_TRANSACTION_METHODS_ARRAY contains all WcTransactionRequest methods
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allMethodsHandled: (typeof WC_TRANSACTION_METHODS_ARRAY)[number] extends WcSendTransactionRequest['method']
  ? true
  : false = true;

export function isTransactionRequest(
  r: SignClientTypes.EventArguments['session_request']['params']['request'],
): r is WcSendTransactionRequest {
  return WC_TRANSACTION_METHODS.has(r.method);
}
