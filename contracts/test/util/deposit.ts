import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Safe } from 'lib';
import { allSigners } from './wallet';

export const deposit = async (safe: Safe, amount: string | BigNumber) => {
  const donor = allSigners[allSigners.length - 1];

  if (typeof amount === 'string') amount = ethers.utils.parseEther(amount);

  await donor.transfer({
    to: safe.address,
    amount,
  });
};
