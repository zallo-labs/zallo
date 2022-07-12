import {
  createUpsertGroupTx,
  getMerkleTree,
  PERCENT_THRESHOLD,
  SafeEvent,
  toSafeApprovers,
} from 'lib';
import {
  deploy,
  expect,
  execute,
  toSafeGroupTest,
  deployTestSafe,
  allSigners,
  wallet,
} from './util';

const newGroup = toSafeGroupTest(
  [allSigners[3].address, 40],
  [allSigners[4].address, 40],
  [allSigners[5].address, 20],
);

describe('UpsertGroup', () => {
  it('should successfully execute', async () => {
    const { safe, group } = await deploy([100]);

    await execute(
      safe,
      group,
      group.approvers,
      createUpsertGroupTx(safe, newGroup),
    );
  });

  it('should emit event', async () => {
    const { safe, group } = await deploy([100]);

    const tx = await execute(
      safe,
      group,
      group.approvers,
      createUpsertGroupTx(safe, newGroup),
    );

    await expect(tx).to.emit(safe, SafeEvent.GroupUpserted);
  });

  it('should generate the correct group merkle root', async () => {
    const { safe, group } = await deployTestSafe([50, 70, 12, 39]);

    const expectedRoot = getMerkleTree(group).getHexRoot();
    expect(await safe.getGroupMerkleRoot(group.ref)).to.eq(expectedRoot);
  });

  it('should revert if called from an address other than the safe', async () => {
    const { safe, group } = await deploy([100]);

    const tx = await safe
      .connect(wallet)
      .upsertGroup(group.ref, toSafeApprovers(group.approvers), {
        gasLimit: 40_000,
      });

    await expect(tx.wait()).to.be.reverted; // SafeError.OnlyCallableBySafe
  });

  it("should revert if the approvers don't meet the threshold", async () => {
    const { safe, group, others } = await deploy([100]);

    const newGroup = toSafeGroupTest([
      others[0].address,
      PERCENT_THRESHOLD - 0.1,
    ]);

    const txResp = await execute(
      safe,
      group,
      group.approvers,
      createUpsertGroupTx(safe, newGroup),
    );

    await expect(txResp.wait()).to.be.reverted; // SafeError.BelowThreshold
  });
});
