import { expect } from 'chai';
import {
  AccountError,
  Address,
  asAddress,
  asHex,
  asSelector,
  asTargets,
  Hex,
  TARGETS_ABI,
  Targetslike,
  TestVerifier,
  Tx,
} from 'lib';
import { asTransactionStruct, deployTestVerifier } from '../util/verifier';
import { TestUtil, TestUtil__factory } from 'lib/src/contracts';
import { WALLET, deploy } from '../util';

describe('TargetPermission', () => {
  let verifier = {} as TestVerifier;
  let tester = {} as TestUtil;
  let nonce = 0n;
  let to: Address;
  let data: Hex;

  const verify = (tx: Omit<Tx, 'nonce'>, targets: Targetslike) =>
    verifier.verifyTargetPermission(
      asTransactionStruct({ ...tx, nonce: nonce++ }),
      TARGETS_ABI.asStruct(asTargets(targets)) ?? [],
    );

  before(async () => {
    verifier = await deployTestVerifier();
    tester = TestUtil__factory.connect((await deploy('TestUtil')).address, WALLET);
    to = asAddress(tester.address);
    data = asHex(tester.interface.encodeFunctionData('echo', ['0xabc123']));
  });

  describe('succeed when', () => {
    it('matching target and selector', async () => {
      await expect(verify({ to, data }, { [to]: new Set([asSelector(data)]) })).to.not.be.reverted;
    });

    it('matching target and any selector', async () => {
      await expect(verify({ to, data }, { [to]: new Set(['*']) })).to.not.be.reverted;
    });

    it('fallback target and matching selector', async () => {
      await expect(verify({ to, data }, { '*': new Set([asSelector(data)]) })).to.not.be.reverted;
    });
  });

  describe('revert when', () => {
    it('no matching target', async () => {
      await expect(verify({ to, data }, {})).to.be.reverted; /*WithCustomError(
        verifier,
        AccountError.NotToAnyOfTargets,
      ); */
    });

    it('matching target but no matching selector', async () => {
      await expect(verify({ to, data }, { [to]: new Set([]) })).to.be.reverted; /*WithCustomError(
        verifier,
        AccountError.NotAnyOfTargetSelectors,
      );*/
    });

    it('matching target target but no matching selector, where fallback target & any selector exists', async () => {
      await expect(verify({ to, data }, { [to]: new Set([]), '*': new Set(['*']) })).to.be.reverted; //WithCustomError(verifier, AccountError.NotAnyOfTargetSelectors);
    });
  });
});
