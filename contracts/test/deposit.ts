import { ethers } from 'hardhat';
import { SafeEvent } from 'lib';

import { expect } from './util';
import { deploy } from './factory';

describe('Deposit', () => {
  it('Transfer received', async () => {
    const {
      safe,
      others: [donor],
    } = await deploy([100]);

    const value = ethers.utils.parseEther('1');
    const depositTx = await donor.sendTransaction({
      to: safe.address,
      value,
    });

    expect(depositTx)
      .to.emit(safe, SafeEvent.Deposit)
      .withArgs(donor.address, value);
  });

  it('Invalid call is received as a deposit', async () => {
    const {
      safe,
      others: [nonApprover],
    } = await deploy([100]);

    const value = ethers.utils.parseEther('1');
    const depositTx = await nonApprover.sendTransaction({
      to: safe.address,
      value,
      data: '0x123123123123132211', // Invalid call data
    });

    expect(depositTx)
      .to.emit(safe, SafeEvent.Deposit)
      .withArgs(nonApprover.address, value);
  });
});
