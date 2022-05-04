import { ethers } from 'ethers';

export type Address = string;

// Ensures address has checksum
export const toAddress = (addr: string): Address =>
  ethers.utils.getAddress(addr);

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
