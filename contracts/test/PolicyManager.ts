import { expect } from 'chai';
import {
  POLICY_ABI,
  TestPolicyManager,
  TestPolicyManager__factory,
  asPolicy,
  hashPolicy,
  zeroHexBytes,
} from 'lib';
import { deploy, gasLimit, WALLET } from './util';

describe('PolicyManager', () => {
  let manager = {} as TestPolicyManager;

  before(async () => {
    const contract = await deploy('TestPolicyManager');
    manager = TestPolicyManager__factory.connect(contract.address, WALLET);
  });

  const policy = asPolicy({ key: 1, approvers: [] });
  const addPolicy = async () =>
    await (await manager.testAddPolicy(POLICY_ABI.asStruct(policy), { gasLimit })).wait();

  describe('addPolicy', () => {
    it('set polcy hash', async () => {
      await addPolicy();

      expect(await manager.getPolicyHash(policy.key)).to.eq(hashPolicy(policy));
    });

    it('emit event', async () => {
      await expect(manager.testAddPolicy(POLICY_ABI.asStruct(policy), { gasLimit }))
        .to.emit(manager, manager.interface.events['PolicyAdded(uint32,bytes32)'].name)
        .withArgs(policy.key, hashPolicy(policy));
    });

    it('revert if not called by account', async () => {
      await expect((await manager.addPolicy(POLICY_ABI.asStruct(policy), { gasLimit })).wait()).to
        .be.rejected; //.revertedWithCustomError(ruleManager, AccountError.OnlyCallableBySelf);
    });
  });

  describe('removePolicy', async () => {
    it('zero policy hash', async () => {
      await addPolicy();

      await (await manager.testRemovePolicy(policy.key, { gasLimit })).wait();

      expect(await manager.getPolicyHash(policy.key)).to.eq(zeroHexBytes(32));
    });

    it('emit event', async () => {
      await addPolicy();

      await expect(manager.testRemovePolicy(policy.key, { gasLimit }))
        .to.emit(manager, manager.interface.events['PolicyRemoved(uint32)'].name)
        .withArgs(policy.key);
    });

    it('revert if not called by account', async () => {
      await addPolicy();

      await expect((await manager.removePolicy(policy.key, { gasLimit })).wait()).to.be.rejected;
    });
  });
});
