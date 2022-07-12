import { ethers } from 'ethers';
import { createRemoveGroupTx, SafeEvent } from 'lib';
import { deploy, deployTestSafe, execute, expect } from './util';

describe('RemoveGroup', () => {
  it('should successfully execute & emit event', async () => {
    const { safe, group } = await deploy([100]);

    const txResp = await execute(
      safe,
      group,
      group.approvers,
      createRemoveGroupTx(safe, group),
    );

    await expect(txResp).to.emit(safe, SafeEvent.GroupRemoved);
  });

  it("should zero group's merkle root", async () => {
    const { safe, group } = await deployTestSafe([100]);

    const txResp = await execute(
      safe,
      group,
      group.approvers,
      createRemoveGroupTx(safe, group),
    );
    await txResp.wait();

    expect(await safe.getGroupMerkleRoot(group.ref)).to.eq(
      ethers.utils.formatBytes32String(''),
    );
  });
});
