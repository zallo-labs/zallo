import { ZERO_ADDR, AwaitedObj, Tx, TestVerifier__factory } from 'lib';
import { TransactionStruct } from 'lib/src/contracts/Account';
import { deploy } from './deploy';
import { WALLET } from './wallet';

export const deployTestVerifier = async () =>
  TestVerifier__factory.connect((await deploy('TestVerifier')).address, WALLET);

export const asTransactionStruct = (tx: Tx): AwaitedObj<TransactionStruct> => ({
  txType: 0,
  from: ZERO_ADDR,
  gasLimit: 0,
  gasPerPubdataByteLimit: 0,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 0,
  paymaster: ZERO_ADDR,
  value: 0n,
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
  nonce: 0n,
};
