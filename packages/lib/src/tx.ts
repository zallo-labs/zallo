import { Address, ETH_ADDRESS, UAddress, asAddress, asChain } from './address';
import { CHAINS } from 'chains';
import { Operation, encodeOperations } from './operation';
import _ from 'lodash';
import { hashTypedData, TypedData, TypedDataDefinition, TypedDataDomain, zeroAddress } from 'viem';
import { TypedDataToPrimitiveTypes } from 'abitype';
import { asFp, paymasterSignedInput } from '.';
import { ETH } from './dapps';
import Decimal from 'decimal.js';

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

export const getAccountTypedDataDomain = (account: UAddress) =>
  ({
    chainId: CHAINS[asChain(account)].id,
    verifyingContract: asAddress(account),
  }) satisfies TypedDataDomain;

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

  // FIXME: Gas griefing attack - *anyone* may re-submit a failed but valid transaction that has sufficient gas for verification but insufficient gas for execution
  // Mitigation: track transaction validation, not execution

  // Encoding operations (to, value, data)[] instead of packed operations
  // Pros: improve HW wallet signing readability; allowing changing operation encoding without changing the Tx hashing
  // Cons: higher gas - but likely by very little?

  /* Fields NOT included: */
  // factoryDeps: not dangerous
  // reserved:        maybe it should be? Currently unused by zkSync
  // reservedDynamic: ^
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
    { name: 'paymaster', type: 'address' },
    { name: 'paymasterSignedInput', type: 'bytes' },
  ] as const,
} satisfies TypedData;

export type TxTypedDataMessage = TypedDataToPrimitiveTypes<typeof TX_EIP712_TYPES>['Tx'];

export function asTypedData(account: UAddress, tx: Tx) {
  const message = {
    ...encodeOperations(asAddress(account), tx.operations),
    nonce: tx.nonce,
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
    domain: getAccountTypedDataDomain(account),
    types: TX_EIP712_TYPES,
    primaryType: 'Tx' as const,
    message,
  } satisfies TypedDataDefinition;
}

export function hashTx(...params: Parameters<typeof asTypedData>) {
  return hashTypedData(asTypedData(...params));
}
