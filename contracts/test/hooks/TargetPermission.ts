import { expect } from 'chai';
import {
  ACCOUNT_ABI,
  Address,
  asAddress,
  asSelector,
  encodeTargetsConfigStruct,
  Hex,
  Operation,
  TargetsConfig,
} from 'lib';
import { deploy, network } from '../util';
import { encodeFunctionData } from 'viem';
import TestVerifier from '../contracts/TestVerifier';
import TestUtil from '../contracts/TestUtil';

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
      ).to.not.be.reverted;
    });

    it('contract and multiple functions', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: {
              [to]: {
                functions: {
                  [asSelector('0x10000000')]: true,
                  [asSelector('0xa0000000')]: true,
                  [asSelector(data)]: true,
                  [asSelector('0xb0000000')]: true,
                  [asSelector('0x20000000')]: true,
                },
                defaultAllow: false,
              },
            },
            default: { functions: {}, defaultAllow: false },
          },
        ),
      ).to.not.be.reverted;
    });

    it('multiple contract and function', async () => {
      await expect(
        verify(
          { to, data },
          {
            contracts: {
              [asAddress('0x0100000000000000000000000000000000000000')]: {
                functions: {},
                defaultAllow: false,
              },
              [asAddress('0xa000000000000000000000000000000000000000')]: {
                functions: {},
                defaultAllow: false,
              },
              [to]: {
                functions: { [asSelector(data)]: true },
                defaultAllow: false,
              },
              [asAddress('0xff00000000000000000000000000000000000000')]: {
                functions: {},
                defaultAllow: false,
              },
              [asAddress('0x2000000000000000000000000000000000000000')]: {
                functions: {},
                defaultAllow: false,
              },
            },
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
