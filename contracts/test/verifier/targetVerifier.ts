import { expect } from 'chai';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { address, TestVerifiers, TestVerifiers__factory, ZERO_ADDR } from 'lib';
import { deploy, WALLET } from '../util';
import { asTransactionStruct, defaultTx } from './util';

describe('TargetVerify', () => {
  let verifiers = {} as TestVerifiers;
  const tx = { ...defaultTx, to: address(hexlify(randomBytes(20))) };

  before(async () => {
    verifiers = TestVerifiers__factory.connect((await deploy('TestVerifiers')).address, WALLET);
  });

  describe('verifyTarget', () => {
    it('succeed when calling the target', async () => {
      await expect(verifiers.verifyTarget(tx.to, asTransactionStruct(tx))).to.not.be.rejected;
    });

    it('revert when not calling the target', async () => {
      await expect(verifiers.verifyTarget(ZERO_ADDR, asTransactionStruct(tx))).to.be.rejected;
    });
  });

  describe('verifyAnyOfTargets', () => {
    it('succeed when calling any of the targets', async () => {
      await expect(verifiers.verifyAnyOfTargets([tx.to], asTransactionStruct(tx))).to.not.be
        .rejected;
    });

    it('revert when not calling any of the targets', async () => {
      await expect(verifiers.verifyAnyOfTargets([ZERO_ADDR], asTransactionStruct(tx))).to.be
        .rejected;
    });
  });
});
