import { Address } from './address';
import { Hex } from './bytes';
import { AbiParameterToPrimitiveType } from 'abitype';
import { encodeAbiParameters, getAbiItem } from 'viem';
import { EXPOSED_ABI } from './contract';
import { MULTI_OP_TX } from './constants';

export interface Operation {
  to: Address;
  value?: bigint;
  data?: Hex;
}

export interface EncodedOperations {
  to: Address;
  value: bigint;
  data: Hex;
}

const operationAbi = getAbiItem({ abi: EXPOSED_ABI, name: 'Operation_' }).inputs[0];
type OperationStruct = AbiParameterToPrimitiveType<typeof operationAbi>;

const operationsAbi = getAbiItem({ abi: EXPOSED_ABI, name: 'Operations' }).inputs[0];

export function encodeOperations(opsParam: Operation[]): EncodedOperations {
  const ops = opsParam.map(
    (op): OperationStruct => ({
      to: op.to,
      value: op.value ?? 0n,
      data: op.data ?? '0x',
    }),
  );

  if (ops.length === 0) throw new Error('No operations provided');

  return ops.length === 1
    ? ops[0]
    : {
        to: MULTI_OP_TX,
        value: 0n,
        data: encodeAbiParameters([operationsAbi], [ops]),
      };
}
