import { bytesToHex } from 'viem';
import { getRandomValues } from 'crypto';

/*//////////////////////////////////////////////////////////////
                                  HEX
//////////////////////////////////////////////////////////////*/

export type Hex = `0x${string}`;
const hexRegex = /^0x[0-9A-Fa-f]*$/;

export function isHex(v: unknown): v is Hex {
  return typeof v === 'string' && hexRegex.test(v);
}

export function asHex<V extends string | null | undefined>(v: V) {
  if (!isHex(v) && !(v === null || v === undefined)) throw new Error(`Expected Hex but got "${v}"`);
  return (v ?? undefined) as unknown as V extends null | undefined ? Hex | undefined : Hex;
}
export function randomHex(n: number) {
  return bytesToHex(getRandomValues(new Uint8Array(n)));
}

export function bytesize(v: Hex) {
  return (v.length - 2) / 2;
}

/*//////////////////////////////////////////////////////////////
                                SELECTOR
//////////////////////////////////////////////////////////////*/

export type Selector = Hex & { __isSelector: true };

export const isSelector = (v: unknown): v is Selector => isHex(v) && bytesize(v) === 4;
export const asSelector = <V extends string | undefined>(v: V) =>
  (v && v.length >= 10 ? asHex(v.slice(0, 10)) : undefined) as V extends undefined
    ? Selector | undefined
    : Selector;
