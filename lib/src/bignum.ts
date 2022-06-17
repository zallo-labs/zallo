import { BigNumber, ethers } from 'ethers';

export const ZERO = ethers.constants.Zero;

export const sumBn = (bn: BigNumber[]) =>
  bn.reduce((acc, b) => acc.add(b), ZERO);
