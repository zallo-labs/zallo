import { Bytes, BytesLike } from 'ethers';
import { arrayify } from 'ethers/lib/utils';

export const EMPTY_BYTES = '0x';

export type Bytes4 = BytesLike;
export type Selector = Bytes4;
export type Bytes8 = BytesLike;

export const byteslikeToBuffer = (b: BytesLike): Buffer => Buffer.from(arrayify(b));

export const bufferToBytes = (b: Buffer): Bytes => Uint8Array.from([...b.values()]);

export const zeroHexBytes = (nBytes: number) => '0x' + '0'.repeat(nBytes * 2);
