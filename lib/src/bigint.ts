import { BigNumber, BigNumberish } from 'ethers';
import { A } from 'ts-toolbelt';

export type BigIntlike = bigint | number | string;

export const asBigInt = (v: BigNumberish) => BigNumber.from(v).toBigInt();

export const asBounded =
  <T extends number>(min: number, max: number) =>
  (value: BigNumberish) => {
    const n = BigNumber.from(value).toNumber();
    if (n < min) throw new Error(`${n} is less than minimum ${min}`);
    if (n > max) throw new Error(`${n} is greater than maximum ${max}`);

    return n as T;
  };

export const asBoundedBigInt =
  <T extends bigint>(min: bigint, max: bigint) =>
  (value: BigNumberish) => {
    const n = asBigInt(value);
    if (n < min) throw new Error(`${n} is less than minimum ${min}`);
    if (n > max) throw new Error(`${n} is greater than maximum ${max}`);

    return n as T;
  };

export const compareBigInt = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0);

export type Uint8 = A.Type<bigint, 'Uint8'>;
export const MIN_UINT8 = 0n as Uint8;
export const MAX_UINT8 = (2n ** 8n - 1n) as Uint8;
export const asUint8 = asBoundedBigInt<Uint8>(MIN_UINT8, MAX_UINT8);

export type Uint16 = A.Type<number, 'Uint16'>;
export const MIN_UINT16 = 0 as Uint16;
export const MAX_UINT16 = (2 ** 16 - 1) as Uint16;
export const asUint16 = asBounded<Uint16>(MIN_UINT16, MAX_UINT16);

export type Uint32 = A.Type<bigint, 'Uint32'>;
export const MIN_UINT32 = 0n as Uint32;
export const MAX_UINT32 = (2n ** 32n - 1n) as Uint32;
export const asUint32 = asBoundedBigInt<Uint32>(MIN_UINT32, MAX_UINT32);

export type Uint256 = A.Type<bigint, 'Uint256'>;
export const MIN_UINT256 = 0n as Uint256;
export const MAX_UINT256 = (2n ** 256n - 1n) as Uint256;
export const asUint256 = asBoundedBigInt<Uint256>(MIN_UINT256, MAX_UINT256);
