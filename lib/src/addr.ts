import { ethers } from 'ethers';
import * as zk from 'zksync-web3';

export type Address = string & { readonly isAddress: true };

export type Addresslike = Address | string;

export const ZERO_ADDR = ethers.constants.AddressZero as Address;

// Ensures address has checksum
export const address = (addr: Addresslike): Address =>
  ethers.utils.getAddress(addr) as Address;

export const tryAddress = (addr: Addresslike): Address | null => {
  try {
    return address(addr);
  } catch (_) {
    return null;
  }
};

export const isAddress = (v: unknown): v is Address =>
  typeof v === 'string' && tryAddress(v) === v;

export const isAddressLike = (v: unknown): v is Addresslike =>
  typeof v === 'string' && ethers.utils.isAddress(v);

export const compareAddress = (a: Address, b: Address) => {
  const aArr = ethers.utils.arrayify(a);
  const bArr = ethers.utils.arrayify(b);

  if (aArr.length > bArr.length) return 1;

  for (let i = 0; i < aArr.length; i++) {
    const diff = aArr[i] - bArr[i];
    if (diff > 0) return 1;
    if (diff < 0) return -1;
  }

  return 0;
};

export const sortAddresses = (addresses: Address[]) =>
  addresses.sort(compareAddress);

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
