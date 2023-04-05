import { expect } from 'chai';
import {
  AccountError,
  Address,
  ANY_SELECTOR,
  asAddress,
  asHex,
  asSelector,
  FALLBACK_ADDRESS,
  Hex,
  TARGET_PERMISSION_ABI,
  TargetPermission,
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

  const verify = (tx: Omit<Tx, 'nonce'>, targets: TargetPermission) =>
    verifier.verifyTargetPermission(
      asTransactionStruct({ ...tx, nonce: nonce++ }),
      TARGET_PERMISSION_ABI.asStruct(targets) ?? [],
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
      await expect(verify({ to, data }, { [to]: new Set([ANY_SELECTOR]) })).to.not.be.reverted;
    });

    it('fallback target and matching selector', async () => {
      await expect(verify({ to, data }, { [FALLBACK_ADDRESS]: new Set([asSelector(data)]) })).to.not
        .be.reverted;
    });
  });

  describe('revert when', () => {
    it('no matching target', async () => {
      await expect(verify({ to, data }, {})).to.be.revertedWithCustomError(
        verifier,
        AccountError.NotToAnyOfTargets,
      );
    });

    it('matching target but no matching selector', async () => {
      await expect(verify({ to, data }, { [to]: new Set([]) })).to.be.revertedWithCustomError(
        verifier,
        AccountError.NotAnyOfTargetSelectors,
      );
    });

    it('matching target target but no matching selector, where fallback target & any selector exists', async () => {
      await expect(
        verify({ to, data }, { [to]: new Set([]), [FALLBACK_ADDRESS]: new Set([ANY_SELECTOR]) }),
      ).to.be.revertedWithCustomError(verifier, AccountError.NotAnyOfTargetSelectors);
    });
  });
});
