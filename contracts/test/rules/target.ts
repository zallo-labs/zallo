import { expect } from 'chai';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { address, TestRules, ZERO_ADDR } from 'lib';
import { asTransactionStruct, defaultTx, deployTestRules } from '../util/rules';

describe('TargetRule', () => {
  let rules = {} as TestRules;
  const tx = { ...defaultTx, to: address(hexlify(randomBytes(20))) };

  before(async () => {
    rules = await deployTestRules();
  });

  describe('verifyTarget', () => {
    it('succeed when calling the target', async () => {
      await expect(rules.verifyTarget(tx.to, asTransactionStruct(tx))).to.not.be.rejected;
    });

    it('revert when not calling the target', async () => {
      await expect(rules.verifyTarget(ZERO_ADDR, asTransactionStruct(tx))).to.be.rejected;
    });
  });

  describe('verifyAnyOfTargets', () => {
    it('succeed when calling any of the targets', async () => {
      await expect(rules.verifyAnyOfTargets([tx.to], asTransactionStruct(tx))).to.not.be.rejected;
    });

    it('revert when not calling any of the targets', async () => {
      await expect(rules.verifyAnyOfTargets([ZERO_ADDR], asTransactionStruct(tx))).to.be.rejected;
    });
  });
});
