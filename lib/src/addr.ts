import { ethers } from 'ethers';
import 'zksync-web3';

export type Address = string & { readonly isAddress: true };

export type Addresslike = Address | string;

// Ensures address has checksum
export const address = (addr: Addresslike): Address =>
  ethers.utils.getAddress(addr) as Address;

export const tryAddress = (addr: Addresslike): Address | null =>
  ethers.utils.isAddress(addr) ? address(addr) : null;

export const isAddress = (v: Addresslike): v is Address => tryAddress(v) === v;

export const compareAddresses = (a: Address, b: Address) => {
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

/* Module augmentation; including in a .ts file to compile into lib's typings */
declare module './typechain' {
  export interface Safe {
    address: Address;
  }

  export interface Factory {
    address: Address;
  }
}

declare module 'zksync-web3' {
  export interface Wallet {
    address: Address;
  }
}
