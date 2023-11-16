import { ethers } from 'ethers';
import * as zk from 'zksync-web3';
import { tryOr } from './util/try';
import { compareBytes } from './bytes';
import { CHAINS, ChainConfig, Chain } from './chains';

export type Address = `0x${string}`;
export type Addresslike = Address | string;

export const ZERO_ADDR = ethers.constants.AddressZero as Address;

export const asAddress = (addr: Addresslike) => ethers.utils.getAddress(addr) as Address;

export const tryAsAddress = <A extends Addresslike | undefined>(addr: A) => {
  const r = tryOr(() => (addr ? ethers.utils.getAddress(addr) : undefined), undefined);

  return r as A extends undefined ? Address | undefined : Address;
};

export const isAddress = (v: unknown): v is Address =>
  typeof v === 'string' && tryAsAddress(v) === v;

export const isAddressLike = (v: unknown): v is Addresslike =>
  typeof v === 'string' && ethers.utils.isAddress(v);

export const compareAddress = (a: Addresslike, b: Addresslike) =>
  compareBytes(asAddress(a), asAddress(b));

export type UAddress = `${ChainConfig['key']}:${Address}`;

let fallbackChain: ChainConfig = CHAINS['zksync-goerli'];
export const setFallbackChain = (c: ChainConfig) => (fallbackChain = c);

export const isUniqueAddress = (v: unknown): v is UAddress => {
  if (typeof v !== 'string') return false;

  const split = v.split(':');
  return split.length === 2 && !!CHAINS[split[0] as Chain] && isAddress(split[1]);
};

export const asChain = (address: UAddress | Address) => {
  if (address.startsWith('0x')) return fallbackChain; // A stop-gap before requiring unique addresses everywhere

  const chain = CHAINS[address.split(':')[0] as Chain];
  if (!chain) throw new Error(`Invalid UniqueAddress or Address: ${address}`);
  return chain;
};

export const asLocalAddress = (address: UAddress | string) =>
  asAddress(address.startsWith('0x') ? address : address.split(':')[1]);

export const tryAsUAddress = (v: string | undefined, chain?: ChainConfig): UAddress | undefined => {
  if (!v) return undefined;

  if (isUniqueAddress(v)) return v;
  if (isAddress(v)) return `${(chain ?? fallbackChain).key}:${asAddress(v)}` as UAddress;
  return undefined;
};

export const asUAddress = (v: string, chain?: ChainConfig): UAddress => {
  const r = tryAsUAddress(v, chain);
  if (!r) throw new Error(`Expected a unique address but got: "${v}"`);
  return r;
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
