import { Address, asAddress } from './address';
import { Hex } from './bytes';
import { AbiParameterToPrimitiveType } from 'abitype';
import { encodeAbiParameters, getAbiItem, numberToHex } from 'viem';
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

const operationsAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'validateOperations' }).inputs[1];

const ACCOUNT_CONTRACTS_OFFSET = 0x10000;
const MULTI_OPERATION_ADDRESS = asAddress(
  numberToHex(ACCOUNT_CONTRACTS_OFFSET + 0x1, { size: 20 }),
);

export function encodeOperations(ops: [Operation, ...Operation[]]): EncodedOperations {
  if (ops.length === 0) throw new Error('No operations provided');

  return {
    to: MULTI_OPERATION_ADDRESS,
    value: 0n,
    data: encodeAbiParameters(
      [operationsAbi],
      [
        ops.map(
          (op): OperationStruct => ({
            to: op.to,
            value: op.value ?? 0n,
            data: op.data ?? '0x',
          }),
        ),
      ],
    ),
  };
}
