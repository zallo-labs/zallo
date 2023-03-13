import { BigNumber, BigNumberish } from 'ethers';

export const compareBigInt = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0);

export const asBigInt = (v: BigNumberish) => BigNumber.from(v).toBigInt();
