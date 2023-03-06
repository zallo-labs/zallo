import { expect } from 'chai';
import { Rule, TestRuleManager, TestRuleManager__factory, zeroHexBytes } from 'lib';
import { deploy, gasLimit, WALLET } from './util';

describe('RuleManager', () => {
  let manager = {} as TestRuleManager;

  before(async () => {
    const contract = await deploy('TestRuleManager');
    manager = TestRuleManager__factory.connect(contract.address, WALLET);
  });

  const rule: Rule = new Rule(1, []);
  const addRule = async () => await (await manager.testAddRule(rule.struct, { gasLimit })).wait();

  describe('addRule', () => {
    it('set rule data', async () => {
      await addRule();

      expect(await manager.getRuleDataHash(rule.key)).to.eq(rule.dataHash);
    });

    it('emit event', async () => {
      await expect(manager.testAddRule(rule.struct, { gasLimit }))
        .to.emit(manager, manager.interface.events['RuleAdded(uint256,bytes32)'].name)
        .withArgs(rule.key, rule.dataHash);
    });

    it('revert if not called by account', async () => {
      await expect((await manager.addRule(rule.struct, { gasLimit })).wait()).to.be.rejected; //.revertedWithCustomError(ruleManager, AccountError.OnlyCallableBySelf);
    });
  });

  describe('removeRule', async () => {
    it('zero data hash', async () => {
      await addRule();

      await (await manager.testRemoveRule(rule.key, { gasLimit })).wait();

      expect(await manager.getRuleDataHash(rule.key)).to.eq(zeroHexBytes(32));
    });

    it('emit event', async () => {
      await addRule();

      await expect(manager.testRemoveRule(rule.key, { gasLimit }))
        .to.emit(manager, manager.interface.events['RuleRemoved(uint256)'].name)
        .withArgs(rule.key);
    });

    it('revert if not called by account', async () => {
      await addRule();

      await expect((await manager.removeRule(rule.key, { gasLimit })).wait()).to.be.rejected;
    });
  });
});
