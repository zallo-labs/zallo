import { Bytes, BytesLike, ethers } from 'ethers';
import {
  arrayify,
  hexDataSlice,
  hexlify,
  isHexString as baseIsHexString,
  hexDataLength,
} from 'ethers/lib/utils';
import { A } from 'ts-toolbelt';

export type Hex = A.Type<`0x${string}`, 'Hex'>;
export const isHex = (v: unknown, len?: number): v is Hex => baseIsHexString(v, len);
export const asHex = <V extends BytesLike | null | undefined>(v: V, len?: number) => {
  const hex = v !== undefined && v !== null ? hexlify(v) : undefined;
  if (len && hex?.length !== 2 + 2 * len) throw new Error(`Must be at ${len} bytes`);

  return hex as V extends undefined ? Hex | undefined : Hex;
};
export const EMPTY_HEX_BYTES = '0x' as Hex;

export type Selector = Hex & { __isSelector: true };

export const isSelector = (v: unknown): v is Selector => isHex(v, 4);
export const asSelector = <V extends BytesLike | undefined>(v: V) =>
  (v && hexDataLength(v) >= 4 ? asHex(hexDataSlice(v, 0, 4), 4) : undefined) as V extends undefined
    ? Selector | undefined
    : Selector;

export const byteslikeToBuffer = (b: BytesLike): Buffer => Buffer.from(arrayify(b));

export const bufferToBytes = (b: Buffer): Bytes => Uint8Array.from([...b.values()]);

export const zeroHexBytes = (nBytes: number) => ('0x' + '0'.repeat(nBytes * 2)) as unknown as Hex;

export const compareBytes = (a: BytesLike, b: BytesLike) => {
  const aArr = ethers.utils.arrayify(a);
  const bArr = ethers.utils.arrayify(b);

  if (aArr.length > bArr.length) return 1;

  for (let i = 0; i < aArr.length; i++) {
    const diff = aArr[i]! - bArr[i]!;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
  }

  return 0;
};
