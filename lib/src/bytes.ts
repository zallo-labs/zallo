import { Bytes, BytesLike } from 'ethers';
import { arrayify, hexDataSlice, hexlify, isHexString as baseIsHexString } from 'ethers/lib/utils';
import { A } from 'ts-toolbelt';

export type HexString = A.Type<string, 'HexString'>;

export const isHexString = (v: unknown, len?: number): v is HexString => baseIsHexString(v, len);

export const asHexString = (v: BytesLike, len?: number): HexString => {
  const hex = hexlify(v);

  if (len && hex.length !== 2 + 2 * len) throw new Error(`Must be at ${len} bytes`);

  return hex as HexString;
};

export const ZERO_BYTES = '0x' as HexString;

export type Selector = A.Type<string, 'Selector'>;
export const asSelector = (v: BytesLike) =>
  asHexString(hexDataSlice(v, 0, 4), 4) as unknown as Selector;

export const byteslikeToBuffer = (b: BytesLike): Buffer => Buffer.from(arrayify(b));

export const bufferToBytes = (b: Buffer): Bytes => Uint8Array.from([...b.values()]);

export const zeroHexBytes = (nBytes: number) => '0x' + '0'.repeat(nBytes * 2);
