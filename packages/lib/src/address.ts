import * as viem from 'viem';
import { tryOrIgnore } from './util/try';
import { Chain, isChain } from 'chains';

/*//////////////////////////////////////////////////////////////
                              ADDRESSLIKE
//////////////////////////////////////////////////////////////*/

export type Addresslike = string;

const addresslikeRegex = /^0x[a-fA-F0-9]{40}$/;

export const isAddressLike = (v: unknown): v is string =>
  typeof v === 'string' && addresslikeRegex.test(v);

/*//////////////////////////////////////////////////////////////
                                ADDRESS
//////////////////////////////////////////////////////////////*/

export type Address = `0x${string}`; // Checksummed

export const ZERO_ADDR: Address = '0x0000000000000000000000000000000000000000';
export const ETH_ADDRESS = ZERO_ADDR;

export const tryAsAddress = (v: Addresslike | undefined): Address | undefined => {
  if (!v || v.length < 42) return undefined;

  const address = tryOrIgnore(() => viem.getAddress(v));
  if (address) return address;

  const uaddressParts = v.split(':');
  if (uaddressParts.length === 2) return tryAsAddress(uaddressParts[1]); // Can only recurse at most once
};

export const asAddress = <A extends Addresslike | undefined>(value: A) => {
  const address = tryAsAddress(value);
  if (!address && value !== undefined) throw new Error(`Expected Address but got "${value}"`);
  return address as A extends undefined ? Address | undefined : Address;
};

export const isAddress = (v: unknown): v is Address =>
  typeof v === 'string' && tryAsAddress(v) === v; // A value may not be a valid Address but may be convertable

export const compareAddress = (a: Addresslike, b: Addresslike) =>
  asAddress(a).toLowerCase().localeCompare(asAddress(b).toLowerCase());

/*//////////////////////////////////////////////////////////////
                                UADDRESS
//////////////////////////////////////////////////////////////*/

export type UAddress = `${Chain}:${Address}`;

// let fallbackChain: Chain = 'zksync-goerli';
// export const setFallbackChain = (c: Chain) => (fallbackChain = c);

export const tryAsUAddress = (v: string | undefined, chain?: Chain): UAddress | undefined => {
  if (!v || v.length < 42) return undefined;

  const parts = v.split(':');
  if (parts.length === 2) {
    const chain = parts[0];
    const address = tryAsAddress(parts[1]); // Checksumms if necessary
    if (isChain(chain) && address) return `${chain}:${address}`;
  }

  const address = tryAsAddress(v);
  if (address) {
    if (!chain) throw new Error(`Chain expected when converting Address -> UAddress`);
    return `${chain}:${address}`;
  }
};

export const asUAddress = <A extends Address | Addresslike | undefined>(
  ...[value, chain]: A extends Address ? [value: A, chain: Chain] : [value: A, chain?: Chain]
) => {
  const address = tryAsUAddress(value, chain);
  if (!address && value !== undefined) throw new Error(`Expected UAddress but got "${value}"`);
  return address as A extends undefined ? UAddress | undefined : UAddress;
};

export const isUAddress = (v: unknown): v is UAddress =>
  typeof v === 'string' && tryAsUAddress(v) === v; // A value may not be a valid UAddress but may be convertable

export const asChain = (address: UAddress): Chain => {
  const chain = address.split(':')[0];
  if (!isChain(chain))
    throw new Error(`Unsupported chain "${chain}" extracted from UAddress "${address}"`);
  return chain;
};
