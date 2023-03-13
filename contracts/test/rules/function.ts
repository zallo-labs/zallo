import { expect } from 'chai';
import { hexDataSlice } from 'ethers/lib/utils';
import { asHex, Erc20__factory, TestRules, Tx } from 'lib';
import { WALLET } from '../util';
import { asTransactionStruct, defaultTx, deployTestRules } from '../util/rules';

describe('FunctionRule', () => {
  let rules = {} as TestRules;
  const tx = {
    ...defaultTx,
    data: asHex(
      Erc20__factory.createInterface().encodeFunctionData('transfer', [WALLET.address, 1]),
    ),
  } satisfies Tx;

  before(async () => {
    rules = await deployTestRules();
  });

  describe('verifyFunction', () => {
    it('succeed when calling the function', async () => {
      const selector = hexDataSlice(tx.data, 0, 4);

      await expect(rules.verifyFunction(selector, asTransactionStruct(tx))).to.not.be.rejected;
    });

    it('revert when not calling the function', async () => {
      await expect(rules.verifyFunction('0x12345678', asTransactionStruct(tx))).to.be.rejected;
    });
  });

  describe('verifyAnyOfFunctions', () => {
    it('succeed when calling any of the functions', async () => {
      const selector = hexDataSlice(tx.data, 0, 4);

      await expect(rules.verifyAnyOfFunctions([selector], asTransactionStruct(tx))).to.not.be
        .rejected;
    });

    it('revert when not calling any of the functions', async () => {
      await expect(rules.verifyAnyOfFunctions(['0x12345678'], asTransactionStruct(tx))).to.be
        .rejected;
    });
  });
});
