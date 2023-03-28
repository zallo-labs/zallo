import { Bytes, BytesLike } from 'ethers';
import { arrayify, hexDataSlice, hexlify, isHexString as baseIsHexString } from 'ethers/lib/utils';
import { A } from 'ts-toolbelt';

export type Hex = A.Type<`0x${string}`, 'Hex'>;
export const isHex = (v: unknown, len?: number): v is Hex => baseIsHexString(v, len);
export const asHex = <V extends BytesLike | undefined>(v: V, len?: number) => {
  const hex = v !== undefined ? hexlify(v) : undefined;
  if (len && hex?.length !== 2 + 2 * len) throw new Error(`Must be at ${len} bytes`);

  return hex as V extends undefined ? Hex | undefined : Hex;
};
export const EMPTY_HEX_BYTES = '0x' as Hex;

export type Selector = A.Type<string, 'Selector'>;
export const asSelector = (v: BytesLike) => asHex(hexDataSlice(v, 0, 4), 4) as unknown as Selector;

export const byteslikeToBuffer = (b: BytesLike): Buffer => Buffer.from(arrayify(b));

export const bufferToBytes = (b: Buffer): Bytes => Uint8Array.from([...b.values()]);

export const zeroHexBytes = (nBytes: number) => ('0x' + '0'.repeat(nBytes * 2)) as unknown as Hex;
