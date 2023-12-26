import { expect } from 'chai';
import { ACCOUNT_ABI, Address, asPolicy, encodePolicyStruct, hashPolicy } from 'lib';
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
});
