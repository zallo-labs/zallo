import { ethers } from 'ethers';
import * as zk from 'zksync-web3';
import { A } from 'ts-toolbelt';
import { tryOr } from './util/try';

export type Address = A.Type<string, 'Address'>;
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

export const compareAddress = (a: Addresslike, b: Addresslike) => {
  const aArr = ethers.utils.arrayify(asAddress(a));
  const bArr = ethers.utils.arrayify(asAddress(b));

  if (aArr.length > bArr.length) return 1;

  for (let i = 0; i < aArr.length; i++) {
    const diff = aArr[i]! - bArr[i]!;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
  }

  return 0;
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
