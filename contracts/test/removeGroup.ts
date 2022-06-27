import { ethers } from 'ethers';
import { createRemoveGroupOp, SafeEvent } from 'lib';
import { deployTestSafe, execute, expect } from './util';

describe('RemoveGroup', () => {
  it('should successfully remove group', async () => {
    const { safe, group } = await deployTestSafe();

    const rmGroupOp = createRemoveGroupOp(safe as any, group);
    const tx = await execute(safe as any, group, group.approvers, rmGroupOp);

    await expect(tx).to.emit(safe, SafeEvent.GroupRemoved);
  });

  it("should zero out group's merkle root", async () => {
    const { safe, group } = await deployTestSafe();

    const rmGroupOp = createRemoveGroupOp(safe as any, group);
    const tx = await execute(safe as any, group, group.approvers, rmGroupOp);

    await tx.wait();
    expect(await safe.getMerkleRoot(group.ref)).to.eq(
      ethers.utils.formatBytes32String(''),
    );
  });
});
