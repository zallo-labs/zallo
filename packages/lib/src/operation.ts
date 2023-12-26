import { Address } from './address';
import { Hex } from './bytes';
import { AbiParameterToPrimitiveType } from 'abitype';
import { encodeAbiParameters, getAbiItem } from 'viem';
import { TEST_VERIFIER_ABI } from '.';

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

const operationAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'validateTarget' }).inputs[0];
type OperationStruct = AbiParameterToPrimitiveType<typeof operationAbi>;

const operationsAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'validate' }).inputs[1];

export function encodeOperations(
  account: Address,
  ops: Operation | Operation[],
): EncodedOperations {
  if (!Array.isArray(ops)) ops = [ops];

  const opStructs = ops.map(
    (op): OperationStruct => ({
      to: op.to,
      value: op.value ?? 0n,
      data: op.data ?? '0x',
    }),
  );

  if (opStructs.length === 0) throw new Error('No operations provided');
  if (opStructs.length === 1) return opStructs[0];

  return {
    to: account,
    value: 0n,
    data: encodeAbiParameters(
      [{ type: 'bytes4', name: 'selector' }, operationsAbi],
      ['0x00000000', opStructs],
    ),
  };
}
