import { expect } from 'chai';
import {
  AccountError,
  Address,
  asAddress,
  asHex,
  asSelector,
  Hex,
  Operation,
  TARGETS_ABI,
  TargetsConfig,
  TestVerifier,
} from 'lib';
import { deployTestVerifier } from '../util/verifier';
import { TestUtil, TestUtil__factory } from 'lib/src/contracts';
import { WALLET, deploy } from '../util';

describe('TargetPermission', () => {
  let verifier = {} as TestVerifier;
  let tester = {} as TestUtil;
  let to: Address;
  let data: Hex;

  const verify = (op: Operation, targets: TargetsConfig) =>
    verifier.validateTarget(
      {
        to: op.to,
        value: op.value ?? 0n,
        data: op.data ?? '0x',
      },
      TARGETS_ABI.asStruct(targets),
    );

  before(async () => {
    verifier = await deployTestVerifier();
    tester = TestUtil__factory.connect((await deploy('TestUtil')).address, WALLET);
    to = asAddress(tester.address);
    data = asHex(tester.interface.encodeFunctionData('echo', ['0xabc123']));
  });

  describe('succeed when', () => {
    it('target and selector', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: { [to]: { selectors: { [asSelector(data)]: true }, defaultAllow: false } },
            default: { selectors: {}, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('target, no selector, and default allow', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: { [to]: { selectors: {}, defaultAllow: true } },
            default: { selectors: {}, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('no target, and allowed default selector', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: {},
            default: { selectors: { [asSelector(data)]: true }, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('no target, and default allow', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: {},
            default: { selectors: {}, defaultAllow: true },
          },
        ),
      ).to.not.be.reverted;
    });
  });

  describe('revert when', () => {
    it('matching target, deny selector', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: { [to]: { selectors: { [asSelector(data)]: false }, defaultAllow: true } },
            default: { selectors: {}, defaultAllow: true },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });

    it('matching target, no selector, and default deny', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: { [to]: { selectors: {}, defaultAllow: false } },
            default: { selectors: {}, defaultAllow: true },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });

    it('no target, disallowed selector', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: {},
            default: { selectors: { [asSelector(data)]: false }, defaultAllow: true },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });

    it('no target, no selector, and default deny', async () => {
      await expect(
        verify(
          { to, data },
          {
            targets: {},
            default: { selectors: {}, defaultAllow: false },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });
  });
});
