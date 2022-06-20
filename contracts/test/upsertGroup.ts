import {
  createUpsertGroupOp,
  EXECUTE_GAS_LIMIT,
  getMerkleTree,
  Safe,
  SafeEvent,
  toSafeApprovers,
} from 'lib';
import {
  deploy,
  expect,
  execute,
  toSafeGroupTest,
  deployTestSafe,
} from './util';

describe('UpsertGroup', () => {
  it('should succeed when appprover weights satisfies threshold', async () => {
    const { safe, group, others } = await deploy([100]);

    const newGroup = toSafeGroupTest(
      [others[0].address, 50],
      [others[1].address, 50],
    );

    const tx = await execute(
      safe,
      group,
      group.approvers,
      createUpsertGroupOp(safe, newGroup),
    );

    await expect(tx).to.emit(safe, SafeEvent.GroupUpserted);
  });

  it('should generate valid merkle root', async () => {
    const { safe, group, others } = await deployTestSafe([125, 2, 28]);

    const newGroup = toSafeGroupTest([others[0].address, 100]);

    const tx = await execute(
      safe as any as Safe,
      group,
      group.approvers,
      createUpsertGroupOp(safe as any as Safe, newGroup),
    );
    await tx.wait();

    const tree = getMerkleTree(newGroup);
    expect(await safe.getMerkleRoot(newGroup.id)).to.eq(tree.getHexRoot());
  });

  it('should be reverted when not called by the safe', async () => {
    const { safe, group } = await deploy([100]);

    const tx = await safe.upsertGroup(
      group.id,
      toSafeApprovers(group.approvers),
      { gasLimit: EXECUTE_GAS_LIMIT },
    );

    await expect(tx.wait()).to.be.reverted; // SafeError.OnlyCallableBySafe
  });

  it('should be reverted when approver weights are bellow threshold', async () => {
    const { safe, group, others } = await deploy([40, 40, 40]);

    const newGroup = toSafeGroupTest([others[0].address, 99.999999999]);

    const tx = await execute(
      safe,
      group,
      group.approvers,
      createUpsertGroupOp(safe, newGroup),
    );

    await expect(tx.wait()).to.be.reverted; // SafeError.BelowThreshold
  });
});
