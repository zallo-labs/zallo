import { ethers } from 'hardhat';
import { deploy } from './deployment';
import { expect } from './util';
import { SafeEvent } from 'lib';

describe('Deposit', () => {
  it('Transfer received', async () => {
    const {
      safe,
      others: [nonApprover],
    } = await deploy([100]);

    const value = ethers.utils.parseEther('1');
    const depositTx = await nonApprover.sendTransaction({
      to: safe.address,
      value,
    });

    expect(depositTx).to.emit(safe, SafeEvent.Deposit).withArgs(nonApprover.address, value);
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

    expect(depositTx).to.emit(safe, SafeEvent.Deposit).withArgs(nonApprover.address, value);
  });
});
