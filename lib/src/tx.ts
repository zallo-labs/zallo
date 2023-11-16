import { Address, asChain } from './address';
import { asHex, EMPTY_HEX_BYTES } from './bytes';
import { Operation, encodeOperationsData } from './operation';
import _ from 'lodash';
import { hashTypedData, TypedData, TypedDataDomain } from 'viem';

export interface Tx {
  operations: [Operation, ...Operation[]];
  nonce: bigint;
  gasLimit?: bigint;
}

export type TxOptions = Omit<Tx, 'operations'> &
  ((Operation & { operations?: never }) | { operations: [Operation, ...Operation[]] });

export const asTx = (o: TxOptions): Tx => ({
  ..._.omit(o, 'operations'),
  operations: 'operations' in o ? o.operations! : [_.pick(o, ['to', 'value', 'data'])],
});

export interface TransactionData extends Omit<Tx, 'operations'>, Operation {}

export const asTransactionData = (account: Address, tx: Tx): TransactionData => ({
  ...(tx.operations.length === 1
    ? tx.operations[0]
    : {
        to: account,
        data: encodeOperationsData(tx.operations),
      }),
  nonce: tx.nonce,
  gasLimit: tx.gasLimit,
});

export const getAccountTypedDataDomain = (account: Address) =>
  ({
    chainId: asChain(account).id,
    verifyingContract: account,
  }) satisfies TypedDataDomain;

export const TX_EIP712_TYPES = {
  /* Consider: */
  // Encoding operations (to, value, data)[] instead of packed operations
  // Pros: improve HW wallet signing readability; allowing changing operation encoding without changing the Tx hashing
  // Cons: higher gas - but likely by very little?
  //
  // maxFeePerGas
  // maxPriorityFeePerGas
  // paymaster: problematic as this would require re-signing for ETH <-> non-ETH feeToken switching (unless the same paymaster is used regardless)

  /* Fields NOT included: */
  // gasLimit: not dangerous and can't be predicted due to approvals requiring gas; a maxGasFee could be implemented instead
  // gasPerPubdataByteLimit: maybe it should be?
  // paymasterInput: minimalAllowance can't be predicted and changing fee token would require re-signing
  // factoryDeps: not dangerous
  // reserved:        maybe it should be? Currently unused by zkSync
  // reservedDynamic: ^
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
  ],
} satisfies TypedData;

export const getTransactionTypedDataMessage = (tx: Tx, account: Address) => {
  const txData = asTransactionData(account, tx);

  return {
    to: txData.to,
    value: txData.value ?? 0n,
    data: txData.data ?? EMPTY_HEX_BYTES,
    nonce: txData.nonce,
  } satisfies TransactionData;
};

export const hashTx = (account: Address, tx: Tx) =>
  asHex(
    hashTypedData({
      domain: getAccountTypedDataDomain(account),
      types: TX_EIP712_TYPES,
      primaryType: 'Tx',
      message: getTransactionTypedDataMessage(tx, account),
    }),
  );
