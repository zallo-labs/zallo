import { Address, ETH_ADDRESS, UAddress } from './address';
import { Operation } from './operation';
import _ from 'lodash';
import { hashTypedData, TypedData, TypedDataDefinition, zeroAddress } from 'viem';
import { TypedDataToPrimitiveTypes } from 'abitype';
import { asFp, paymasterSignedInput } from '.';
import { ETH } from './dapps';
import Decimal from 'decimal.js';
import { getContractTypedDataDomain } from './util/typed-data';

export interface Tx {
  operations: [Operation, ...Operation[]];
  nonce: bigint;
  gas?: bigint;
  paymaster?: Address;
  feeToken?: Address;
  paymasterEthFee?: Decimal;
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
    { name: 'validFrom', type: 'uint256' },
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
  const message = {
    operations: tx.operations.map((op) => ({
      to: op.to,
      value: op.value ?? 0n,
      data: op.data ?? '0x',
    })),
    validFrom: tx.nonce,
    paymaster: tx.paymaster ?? zeroAddress,
    paymasterSignedInput: paymasterSignedInput(
      tx.paymaster
        ? {
            token: tx.feeToken ?? ETH_ADDRESS,
            paymasterFee: tx.paymasterEthFee ? asFp(tx.paymasterEthFee, ETH) : 0n,
          }
        : '0x',
    ),
  } satisfies TxTypedDataMessage;

  return {
    domain: getContractTypedDataDomain(account),
    types: TX_EIP712_TYPES,
    primaryType: 'Tx' as const,
    message,
  } satisfies TypedDataDefinition;
}

export function hashTx(...params: Parameters<typeof asTypedData>) {
  return hashTypedData(asTypedData(...params));
}
