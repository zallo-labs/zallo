import { ZERO_ADDR, ZERO, AwaitedObj, Tx } from 'lib';
import { TransactionStruct } from 'lib/src/contracts/Account';

export const asTransactionStruct = (tx: Tx): AwaitedObj<TransactionStruct> => ({
  txType: 0,
  from: ZERO_ADDR,
  gasLimit: 0,
  gasPerPubdataByteLimit: 0,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 0,
  paymaster: ZERO_ADDR,
  value: ZERO,
  reserved: [0, 0, 0, 0],
  data: [],
  signature: [],
  factoryDeps: [],
  paymasterInput: [],
  reservedDynamic: [],
  ...tx,
});

export const defaultTx: Tx = {
  to: ZERO_ADDR,
  nonce: ZERO,
};
