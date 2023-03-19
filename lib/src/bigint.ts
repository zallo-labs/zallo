import { BigNumber, BigNumberish } from 'ethers';
import { A } from 'ts-toolbelt';

export type BigIntlike = BigNumberish;

export const asBigInt = (v: BigIntlike) => BigNumber.from(v).toBigInt();

export const asBoundedBigInt =
  <T extends bigint>(min: bigint, max: bigint) =>
  (value: BigIntlike) => {
    const n = asBigInt(value);
    if (n < min) throw new Error(`${n} is less than minimum ${MIN_UINT256}`);
    if (n > max) throw new Error(`${n} is greater than maximum ${MAX_UINT256}`);

    return n as T;
  };

export const compareBigInt = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0);

export type Uint8 = A.Type<bigint, 'Uint8'>;
export const MIN_UINT8 = 0n as Uint8;
export const MAX_UINT8 = (2n ** 8n - 1n) as Uint8;
export const asUint8 = asBoundedBigInt<Uint8>(MIN_UINT8, MAX_UINT8);

export type Uint32 = A.Type<bigint, 'Uint32'>;
export const MIN_UINT32 = 0n as Uint32;
export const MAX_UINT32 = (2n ** 32n - 1n) as Uint32;
export const asUint32 = asBoundedBigInt<Uint32>(MIN_UINT32, MAX_UINT32);

export type Uint256 = A.Type<bigint, 'Uint256'>;
export const MIN_UINT256 = 0n as Uint256;
export const MAX_UINT256 = (2n ** 256n - 1n) as Uint256;
export const asUint256 = asBoundedBigInt<Uint256>(MIN_UINT256, MAX_UINT256);

/* JSON */
const JSON_PATTERN = /^BigInt::([0-9]+)$/;
export function bigIntReviever(this: unknown, _key: string, v: unknown) {
  if (typeof v === 'string') {
    const m = JSON_PATTERN.exec(v);
    if (m) return BigInt(m[1]);
  }
  return v;
}

export function bigIntReplacer(this: unknown, _key: string, v: unknown) {
  return v instanceof BigInt ? `BigInt::${v.toString()}` : v;
}
