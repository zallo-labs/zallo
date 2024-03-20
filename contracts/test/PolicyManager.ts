import { expect } from 'chai';
import {
  ACCOUNT_ABI,
  Address,
  PLACEHOLDER_ACCOUNT_ADDRESS,
  Policy,
  asPolicy,
  asPolicyKey,
  asSelector,
  encodePolicyStruct,
  hashPolicy,
  replaceSelfAddress,
} from 'lib';
import { deploy, gas, network, wallet } from './util';
import TestPolicyManager, { abi } from './contracts/TestPolicyManager';
import { zeroHash } from 'viem';

describe('PolicyManager', () => {
  let address: Address;

  before(async () => {
    address = (await deploy(TestPolicyManager)).address;
  });

  const policy = asPolicy({ key: 1, approvers: [] });
  const addPolicy = async () =>
    await wallet.writeContract({
      address,
      abi,
      functionName: 'testAddPolicy',
      args: [encodePolicyStruct(policy)],
      gas,
    });

  describe('addPolicy', () => {
    it('set polcy hash', async () => {
      await addPolicy();

      expect(
        await network.readContract({
          address,
          abi,
          functionName: 'getPolicyHash',
          args: [policy.key],
        }),
      ).to.eq(hashPolicy(policy));
    });

    it('emit event', async () => {
      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'testAddPolicy',
          args: [encodePolicyStruct(policy)],
          gas,
        }),
      ).to.includeEvent({
        abi: ACCOUNT_ABI,
        eventName: 'PolicyAdded',
        args: { key: policy.key, hash: hashPolicy(policy) },
      });
    });

    it('revert if not called by account', async () => {
      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'addPolicy',
          args: [encodePolicyStruct(policy)],
          gas,
        }),
      ).to.revert; // OnlyCallableBySelf
    });
  });

  describe('removePolicy', async () => {
    it('zero policy hash', async () => {
      await addPolicy();

      await wallet.writeContract({
        address,
        abi,
        functionName: 'testRemovePolicy',
        args: [policy.key],
        gas,
      });

      expect(
        await network.readContract({
          abi,
          address,
          functionName: 'getPolicyHash',
          args: [policy.key],
        }),
      ).to.eq(zeroHash);
    });

    it('emit event', async () => {
      await addPolicy();

      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'testRemovePolicy',
          args: [policy.key],
          gas,
        }),
      ).to.includeEvent({
        abi: ACCOUNT_ABI,
        eventName: 'PolicyRemoved',
        args: { key: policy.key },
      });
    });

    it('revert if not called by account', async () => {
      await addPolicy();

      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'removePolicy',
          args: [policy.key],
          gas,
        }),
      ).to.revert;
    });
  });

  describe('initializeWithPolicies', () => {
    it('adds policies', async () => {
      await addPolicy();

      const policy1 = { ...policy, key: asPolicyKey(0) };
      const policy2 = { ...policy, key: asPolicyKey(1) };
      await wallet.writeContract({
        address,
        abi,
        functionName: 'testInitializeWithPolicies',
        args: [[encodePolicyStruct(policy1), encodePolicyStruct(policy2)]],
        gas,
      });

      expect(
        await network.readContract({
          address,
          abi,
          functionName: 'getPolicyHash',
          args: [policy1.key],
        }),
      ).to.eq(hashPolicy(policy1));
      expect(
        await network.readContract({
          address,
          abi,
          functionName: 'getPolicyHash',
          args: [policy2.key],
        }),
      ).to.eq(hashPolicy(policy2));
    });

    it('replaces placeholder self address', async () => {
      const policy1 = asPolicy({
        key: asPolicyKey(0),
        approvers: [],
        threshold: 0,
        permissions: {
          transfers: { limits: {}, defaultAllow: false },
          targets: {
            contracts: {
              [PLACEHOLDER_ACCOUNT_ADDRESS]: { functions: {}, defaultAllow: true },
            },
            default: {
              functions: { [asSelector('0x6cbe96fa')]: true },
              defaultAllow: false,
            },
          },
          delay: 1,
        },
      });
      await wallet.writeContract({
        address,
        abi,
        functionName: 'testInitializeWithPolicies',
        args: [[encodePolicyStruct(policy1)]],
        gas,
      });

      const transformedPolicy1 = replaceSelfAddress({ policy: policy1, to: address });
      expect(
        await network.readContract({
          address,
          abi,
          functionName: 'getPolicyHash',
          args: [transformedPolicy1.key],
        }),
      ).to.eq(hashPolicy(transformedPolicy1));
    });
  });
});
