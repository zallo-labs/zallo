import { expect } from 'chai';
import { hexDataSlice } from 'ethers/lib/utils';
import { Erc20__factory, TestVerifiers, TestVerifiers__factory, Tx } from 'lib';
import { deploy, WALLET } from '../util';
import { asTransactionStruct, defaultTx } from './util';

describe('FunctionVerifier', () => {
  let verifiers = {} as TestVerifiers;
  const tx = {
    ...defaultTx,
    data: Erc20__factory.createInterface().encodeFunctionData('transfer', [WALLET.address, 1]),
  } satisfies Tx;

  before(async () => {
    verifiers = TestVerifiers__factory.connect((await deploy('TestVerifiers')).address, WALLET);
  });

  describe('verifyFunction', () => {
    it('succeed when calling the function', async () => {
      const selector = hexDataSlice(tx.data, 0, 4);

      await expect(verifiers.verifyFunction(selector, asTransactionStruct(tx))).to.not.be.rejected;
    });

    it('revert when not calling the function', async () => {
      await expect(verifiers.verifyFunction('0x12345678', asTransactionStruct(tx))).to.be.rejected;
    });
  });

  describe('verifyAnyOfFunctions', () => {
    it('succeed when calling any of the functions', async () => {
      const selector = hexDataSlice(tx.data, 0, 4);

      await expect(verifiers.verifyAnyOfFunctions([selector], asTransactionStruct(tx))).to.not.be
        .rejected;
    });

    it('revert when not calling any of the functions', async () => {
      await expect(verifiers.verifyAnyOfFunctions(['0x12345678'], asTransactionStruct(tx))).to.be
        .rejected;
    });
  });
});
