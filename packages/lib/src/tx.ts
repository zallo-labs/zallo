import { Address, UAddress, asAddress, asChain } from './address';
import { CHAINS } from 'chains';
import { Operation, encodeOperationsData } from './operation';
import _ from 'lodash';
import { hashTypedData, TypedData, TypedDataDefinition, TypedDataDomain } from 'viem';

export interface Tx {
  operations: [Operation, ...Operation[]];
  nonce: bigint;
  gas?: bigint;
  // TODO: add maxFeePerGas & maxPriorityFeePerGas
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
  gas: tx.gas,
});

export const getAccountTypedDataDomain = (account: UAddress) =>
  ({
    chainId: CHAINS[asChain(account)].id,
    verifyingContract: asAddress(account),
  }) satisfies TypedDataDomain;

export const TX_EIP712_TYPES = {
  /* Consider: */
  // Encoding operations (to, value, data)[] instead of packed operations
  // Pros: improve HW wallet signing readability; allowing changing operation encoding without changing the Tx hashing
  // Cons: higher gas - but likely by very little?

  /* Fields NOT included: */
  // gas: not dangerous and can't be predicted due to approvals requiring gas; maxGas could be implemented instead
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
    // TODO: add fields
    // maxFeePerGas
    // maxPriorityFeePerGas
    // paymaster
  ] as const,
} satisfies TypedData;

export const getTransactionTypedDataMessage = (tx: Tx, account: Address) => {
  const { to, value = 0n, data = '0x', nonce } = asTransactionData(account, tx);

  return { to, value, data, nonce } satisfies TransactionData;
};

export function asTypedData(account: UAddress, tx: Tx) {
  return {
    domain: getAccountTypedDataDomain(account),
    types: TX_EIP712_TYPES,
    primaryType: 'Tx' as const,
    message: getTransactionTypedDataMessage(tx, asAddress(account)),
  } satisfies TypedDataDefinition;
}

export const hashTx = (account: UAddress, tx: Tx) => hashTypedData(asTypedData(account, tx));
