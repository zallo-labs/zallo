import { Address, Hex } from 'lib';

export interface WalletConnectSendTransactionData {
  from: Address;
  to: Address;
  value?: number | string;
  data?: Hex;
  gasLimit?: number | string;
}

export interface WalletConnectSendTransactionRequest {
  method: 'eth_sendTransaction';
  params: [tx: WalletConnectSendTransactionData];
}

const WC_TRANSACTION_METHODS_ARRAY = [
  // 'eth_signTransaction',
  'eth_sendTransaction',
] as const;

export const WC_TRANSACTION_METHODS = new Set<string>(WC_TRANSACTION_METHODS_ARRAY);

// Assert that WC_TRANSACTION_METHODS_ARRAY contains all WcTransactionRequest methods
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allMethodsHandled: (typeof WC_TRANSACTION_METHODS_ARRAY)[number] extends WalletConnectSendTransactionRequest['method']
  ? true
  : false = true;
