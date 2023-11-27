import { Address } from './address';
import { Hex } from './bytes';
import { parseAbiParameter } from 'abitype';
import { encodeAbiParameters, getAbiItem } from 'viem';
import { TEST_VERIFIER_ABI } from '.';

export interface Operation {
  to: Address;
  value?: bigint;
  data?: Hex;
}

const operationsAbi = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'validate' }).inputs[1];

export function encodeOperationsData(ops: Operation[]): Hex {
  if (ops.length < 2) throw new Error(`Must have at least 2 operations`);

  return encodeAbiParameters(
    [parseAbiParameter('bytes4 selector'), operationsAbi],
    [
      '0x00000000',
      ops.map((op) => ({
        to: op.to,
        value: op.value ?? 0n,
        data: op.data ?? '0x',
      })),
    ],
  );
}
