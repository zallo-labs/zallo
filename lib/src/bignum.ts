import { BigNumber, BigNumberish, ethers } from 'ethers';

export const ZERO = ethers.constants.Zero;
export const TEN = BigNumber.from(10);

export const sumBn = (bn: BigNumber[]) => bn.reduce((acc, b) => acc.add(b), ZERO);

export const compareBn = (a: BigNumber, b: BigNumber) => (a.eq(b) ? 0 : a.gt(b) ? 1 : -1);

export const asBigInt = (v: BigNumberish) => BigNumber.from(v).toBigInt();
