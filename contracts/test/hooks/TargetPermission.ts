import { expect } from 'chai';
import {
  AccountError,
  Address,
  asAddress,
  asHex,
  asSelector,
  Hex,
  Operation,
  TARGETS_CONFIG_ABI,
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

  const verify = (op: Operation, contracts: TargetsConfig) =>
    verifier.validateTarget(
      {
        to: op.to,
        value: op.value ?? 0n,
        data: op.data ?? '0x',
      },
      TARGETS_CONFIG_ABI.asStruct(contracts),
    );

  before(async () => {
    verifier = await deployTestVerifier();
    tester = TestUtil__factory.connect((await deploy('TestUtil')).address, WALLET);
    to = asAddress(tester.address);
    data = asHex(tester.interface.encodeFunctionData('echo', ['0xabc123']));
  });

  describe('succeed when', () => {
    it('contract and function', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: { [to]: { functions: { [asSelector(data)]: true }, defaultAllow: false } },
            default: { functions: {}, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('contract, no function, and default allow', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: { [to]: { functions: {}, defaultAllow: true } },
            default: { functions: {}, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('no contract, and allowed default function', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: {},
            default: { functions: { [asSelector(data)]: true }, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('no contract, and default allow', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: {},
            default: { functions: {}, defaultAllow: true },
          },
        ),
      ).to.not.be.reverted;
    });
  });

  describe('revert when', () => {
    it('matching contract, deny function', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: { [to]: { functions: { [asSelector(data)]: false }, defaultAllow: true } },
            default: { functions: {}, defaultAllow: true },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });

    it('matching contract, no function, and default deny', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: { [to]: { functions: {}, defaultAllow: false } },
            default: { functions: {}, defaultAllow: true },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });

    it('no contract, disallowed function', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: {},
            default: { functions: { [asSelector(data)]: false }, defaultAllow: true },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });

    it('no contract, no function, and default deny', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: {},
            default: { functions: {}, defaultAllow: false },
          },
        ),
      ).to.be.revertedWithCustomError(verifier, AccountError.TargetDenied);
    });
  });
});
