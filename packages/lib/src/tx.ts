import { Address, ETH_ADDRESS, UAddress } from './address';
import { Operation, encodeOperations } from './operation';
import _ from 'lodash';
import { getAbiItem, hashTypedData, Hex, TypedData, TypedDataDefinition, zeroAddress } from 'viem';
import { AbiParameterToPrimitiveType, TypedDataToPrimitiveTypes } from 'abitype';
import { getContractTypedDataDomain } from './util/typed-data';
import { EXPOSED_ABI } from './contract';
import { paymasterSignedInput } from './paymaster';
import { AllOrNone } from './util';
import { SendTransactionParameters } from 'viem/zksync';
import { ChainConfig } from 'chains';

export interface Tx {
  operations: [Operation, ...Operation[]];
  timestamp: bigint;
  gas?: bigint;
  paymaster?: Address;
  feeToken?: Address;
  maxAmount?: bigint;
}

export type TxOptions = Omit<Tx, 'operations'> &
  ((Operation & { operations?: never }) | { operations: [Operation, ...Operation[]] });

export const asTx = (o: TxOptions): Tx => ({
  ..._.omit(o, 'operations'),
  operations: 'operations' in o ? o.operations! : [_.pick(o, ['to', 'value', 'data'])],
});

export const TX_EIP712_TYPES = {
  /* TODO: add fields */
  // maxPriorityFeePerGas
  // gasPerPubdataByteLimit

  /* Consider: */
  // maxGasLimit: gasLimit must be <= maxGasLimit; this would allow a wide range of gas limits without the downside of setting a high gas limit
  // 1. We can't accurately predict gas as it depends on L1 gas price (which varies up to 15x i.e. 10 gwei -> 150 gwei)
  //    We do still want to set an upper limit on how much the user is willing to pay for the transaction
  // 2. Setting the gasLimit too high means the user pays more than necessary
  // Issue: the operator may perform a single gas griefing attack by submitting a transaction with a high gasLimit

  /* Fields NOT included: */
  // factoryDeps: not dangerous
  // reserved:        maybe it should be? Currently unused by zkSync
  // reservedDynamic: ^
  Tx: [
    { name: 'operations', type: 'Operation[]' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'paymaster', type: 'address' },
    { name: 'paymasterSignedInput', type: 'bytes' },
  ] as const,
  Operation: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ] as const,
} satisfies TypedData;

export type TxTypedDataMessage = TypedDataToPrimitiveTypes<typeof TX_EIP712_TYPES>['Tx'];

export function asTypedData(account: UAddress, tx: Tx) {
  return {
    domain: getContractTypedDataDomain(account),
    types: TX_EIP712_TYPES,
    primaryType: 'Tx' as const,
    message: encodeTxStruct(tx) satisfies TxTypedDataMessage,
  } satisfies TypedDataDefinition;
}

export function hashTx(...params: Parameters<typeof asTypedData>) {
  return hashTypedData(asTypedData(...params));
}

export const TX_ABI = getAbiItem({ abi: EXPOSED_ABI, name: 'Tx_' }).inputs[0];
export type TxStruct = AbiParameterToPrimitiveType<typeof TX_ABI>;

export function encodeTxStruct(tx: Tx): TxStruct {
  if (tx.paymaster && !tx.maxAmount)
    throw new Error('Tx maxAmount is required when paymaster is provided');

  return {
    operations: tx.operations.map((op) => ({
      to: op.to,
      value: op.value ?? 0n,
      data: op.data ?? '0x',
    })),
    timestamp: tx.timestamp,
    paymaster: tx.paymaster ?? zeroAddress,
    paymasterSignedInput: paymasterSignedInput(
      tx.paymaster
        ? {
            token: tx.feeToken ?? ETH_ADDRESS,
            maxAmount: tx.maxAmount!,
          }
        : '0x',
    ),
  };
}

export interface AsSystemTransactionParams {
  tx: Tx;
}

export function asSystemTransaction({ tx }: AsSystemTransactionParams) {
  return {
    ...encodeOperations(tx.operations),
    type: 'eip712',
    gas: tx.gas,
  } satisfies Partial<SendTransactionParameters<ChainConfig>>;
}
