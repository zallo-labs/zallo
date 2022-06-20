import { ethers } from 'ethers';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2098.md
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;
