import { defaultAbiCoder, hexConcat, hexDataLength } from 'ethers/lib/utils';
import { Address } from './address';
import { Hex, asHex } from './bytes';
import { newAbiType } from './util/abi';
import { BigNumber, BigNumberish, BytesLike } from 'ethers';

export interface OperationStruct {
  to: Address;
  value: BigNumberish;
  data: BytesLike;
}

export interface Operation {
  to: Address;
  value?: bigint;
  data?: Hex;
}

const OPERATION_ABI = newAbiType<Operation, OperationStruct>(
  '(address to, uint96 value, bytes data)',
  (op) => ({
    to: op.to,
    value: op.value ?? 0n,
    data: op.data ?? '0x',
  }),
  (opStruct) => {
    const value = BigNumber.from(opStruct.value).toBigInt();

    return {
      to: opStruct.to,
      value: value === 0n ? undefined : value,
      data: hexDataLength(opStruct.data) === 0 ? undefined : asHex(opStruct.data),
    };
  },
);

export const encodeOperationsData = (ops: Operation[]): Hex => {
  if (ops.length < 2) throw new Error(`Must have at least 2 operations`);

  const encodedOps = defaultAbiCoder.encode(
    [`${OPERATION_ABI.type}[]`],
    [ops.map(OPERATION_ABI.asStruct)],
  );

  return asHex(hexConcat(['0x00000000', encodedOps]));
};
