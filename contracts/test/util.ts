import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import chaiAsPromised from 'chai-as-promised';
import { BigNumber } from 'ethers';
import { Safe } from 'lib';

chai.use(solidity);
chai.use(chaiAsPromised); // chaiAsPromised needs to be added last!
export { expect } from 'chai';

export const deposit = async (safe: Safe, value: string | BigNumber) => {
  const signers = await ethers.getSigners();
  const donor = signers[signers.length - 1];

  if (typeof value === 'string') value = ethers.utils.parseEther(value);

  await donor.sendTransaction({
    to: safe.address,
    value,
  });
};
