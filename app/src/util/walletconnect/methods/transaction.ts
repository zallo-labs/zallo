import { BigNumberish, BytesLike } from 'ethers';
import { Address } from 'lib';

export interface WcSendTransactionData {
  from: Address;
  to: Address;
  value?: BigNumberish;
  data?: BytesLike;
  gasLimit?: BigNumberish;
}

export interface SendTransactionRequest {
  method: 'eth_sendTransaction';
  params: [tx: WcSendTransactionData];
}

export type WcTransactionRequest = SendTransactionRequest;

const WC_TRANSACTION_METHODS_ARRAY = [
  // 'eth_signTransaction',
  'eth_sendTransaction',
] as const;

export const WC_TRANSACTION_METHODS = new Set<string>(
  WC_TRANSACTION_METHODS_ARRAY,
);

// Assert that WC_TRANSACTION_METHODS_ARRAY contains all WcTransactionRequest methods
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allMethodsHandled: typeof WC_TRANSACTION_METHODS_ARRAY[number] extends WcTransactionRequest['method']
  ? true
  : false = true;
