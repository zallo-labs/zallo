const WC_TRANSACTION_METHODS_ARRAY = [
  // 'eth_signTransaction',
  'eth_sendTransaction',
] as const;

export const WC_TRANSACTION_METHODS = new Set<string>(
  WC_TRANSACTION_METHODS_ARRAY,
);
export type WcTransactionMethod = typeof WC_TRANSACTION_METHODS_ARRAY[number];
