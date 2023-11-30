import { bytesToHex } from 'viem';
import { getRandomValues } from 'crypto';

/*//////////////////////////////////////////////////////////////
                                  HEX
//////////////////////////////////////////////////////////////*/

export type Hex = `0x${string}`;
const hexRegex = /^0x[0-9A-Fa-f]*$/;

export function isHex(v: unknown, size?: number): v is Hex {
  return (
    typeof v === 'string' && hexRegex.test(v) && (size === undefined || v.length === 2 + 2 * size)
  );
}

export function asHex<V extends string | null | undefined>(v: V, size?: number) {
  if (!isHex(v, size) && !(v === null || v === undefined))
    throw new Error(`Expected Hex but got "${v}"`);
  return v as unknown as V extends undefined ? Hex | undefined : Hex;
}
export function randomHex(n: number) {
  return bytesToHex(getRandomValues(new Uint8Array(n)));
}

export function compareHex(a: Hex, b: Hex) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

/*//////////////////////////////////////////////////////////////
                                SELECTOR
//////////////////////////////////////////////////////////////*/

export type Selector = Hex & { __isSelector: true };

export const isSelector = (v: unknown): v is Selector => isHex(v, 4);
export const asSelector = <V extends string | undefined>(v: V) =>
  (v && v.length >= 10 ? asHex(v.slice(0, 10)) : undefined) as V extends undefined
    ? Selector | undefined
    : Selector;
