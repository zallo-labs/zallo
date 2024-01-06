import { expect } from 'chai';
import { encodeFunctionData } from 'viem';

import {
  ACCOUNT_ABI,
  Address,
  asSelector,
  encodeTargetsConfigStruct,
  Hex,
  Operation,
  TargetsConfig,
} from 'lib';
import TestUtil from '../contracts/TestUtil';
import TestVerifier from '../contracts/TestVerifier';
import { deploy, network } from '../util';

describe('TargetPermission', () => {
  let verifier: Address;
  let tester: Address;
  let to: Address;
  let data: Hex;

  const verify = (op: Operation, targets: TargetsConfig) =>
    network.readContract({
      abi: TestVerifier.abi,
      address: verifier,
      functionName: 'validateTarget',
      args: [
        {
          to: op.to,
          value: op.value ?? 0n,
          data: op.data ?? '0x',
        },
        encodeTargetsConfigStruct(targets),
      ],
    });

  before(async () => {
    verifier = (await deploy(TestVerifier)).address;
    tester = (await deploy(TestUtil)).address;
    to = tester;
    data = encodeFunctionData({
      abi: TestUtil.abi,
      functionName: 'echo',
      args: ['0xabc123'],
    });
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
      ).to.not.be.rejected;
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
      ).to.not.be.rejected;
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
      ).to.not.be.rejected;
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
      ).to.not.be.rejected;
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
      ).to.revertWith({ abi: ACCOUNT_ABI, errorName: 'TargetDenied' });
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
      ).to.revertWith({ abi: ACCOUNT_ABI, errorName: 'TargetDenied' });
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
      ).to.revertWith({ abi: ACCOUNT_ABI, errorName: 'TargetDenied' });
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
      ).to.revertWith({ abi: ACCOUNT_ABI, errorName: 'TargetDenied' });
    });
  });
});
