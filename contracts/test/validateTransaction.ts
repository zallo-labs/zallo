import { createTx } from "lib";
import { deploy, execute, expect, wallet } from "./util"

describe('validateTransaction', () => {
  it('should revert when the transaction has already been executed', async () => {
    const { safe, group } = await deploy([100]);

    const tx = createTx({ to: wallet.address });
    const txResp = await execute(safe, group, group.approvers, tx);
    await txResp.wait();

    const replayedTxResp = execute(safe, group, group.approvers, tx);
    await expect(replayedTxResp).to.be.reverted;
  })
})