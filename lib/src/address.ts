import * as viem from 'viem';
import * as zk from 'zksync-web3';
import { tryOrIgnore } from './util/try';
import { compareBytes } from './bytes';
import { Chain, isChain } from './chains';

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

export const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as Address;

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
  compareBytes(asAddress(a), asAddress(b));

/*//////////////////////////////////////////////////////////////
                                UADDRESS
//////////////////////////////////////////////////////////////*/

export type UAddress = `${Chain}:${Address}`;

let fallbackChain: Chain = 'zksync-goerli';
export const setFallbackChain = (c: Chain) => (fallbackChain = c);

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
    if (!chain) console.trace(`Using fallbackChain`);
    return `${chain ?? fallbackChain}:${address}`;
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

export const asLocalAddress = (address: UAddress): Address => {
  const a = address.split(':')[1];
  if (!isAddress(a))
    throw new Error(`Invalid local address "${a}" extracted from UAddress "${address}"`);
  return a;
};

/* Module augmentation; including in a .ts file to compile into lib's typings */
declare module './contracts/index' {
  export interface Account {
    address: Address;
    provider: zk.Provider;
  }

  export interface TestAccount {
    address: Address;
    provider: zk.Provider;
  }

  export interface Factory {
    address: Address;
  }

  export interface Upgradeable {
    address: Address;
  }

  export interface Multicall {
    address: Address;
  }

  export interface Tester {
    address: Address;
  }
}

declare module './typechain' {
  export interface Erc20 {
    address: Address;
  }
}

declare module 'zksync-web3' {
  export interface Wallet {
    address: Address;
  }
}
