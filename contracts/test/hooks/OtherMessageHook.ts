import { Address } from 'lib';
import { deploy, network } from '../util';
import TestVerifier, { abi } from '../contracts/TestVerifier';
import { ContractFunctionArgs } from 'viem';
import { expect } from 'chai';

describe('OtherMessageHook', () => {
  let address: Address;

  beforeEach(async () => {
    address = (await deploy(TestVerifier)).address;
  });

  const validate = (args: ContractFunctionArgs<typeof abi, 'pure', 'validateOtherMessage'>) =>
    network.readContract({
      address,
      abi,
      functionName: 'validateOtherMessage',
      args,
    });

  it('succeed if allowed', async () => {
    await expect(validate([false, { allow: true }])).to.not.revertWith({
      abi,
      errorName: 'OtherMessageDenied',
    });
  });

  it('revert if not allowed', async () => {
    await expect(validate([false, { allow: false }])).to.revertWith({
      abi,
      errorName: 'OtherMessageDenied',
    });
  });

  it('succeed if already handled (even if not allowed)', async () => {
    await expect(validate([true, { allow: false }])).to.not.revertWith({
      abi,
      errorName: 'OtherMessageDenied',
    });
  });
});
