import { ethers } from 'ethers';
import { createRemoveGroupTx, SafeEvent } from 'lib';
import { deploy, deployTestSafe, execute, expect } from './util';

describe('RemoveAccount', () => {
  it('should successfully execute & emit event', async () => {
    const { safe, account, quorum } = await deploy();

    const txResp = await execute(
      safe,
      account,
      quorum,
      createRemoveGroupTx(safe, account),
    );

    await expect(txResp).to.emit(safe, SafeEvent.AccountRemoved);
  });

  it("should zero account's merkle root", async () => {
    const { safe, account, quorum } = await deployTestSafe();

    const txResp = await execute(
      safe,
      account,
      quorum,
      createRemoveGroupTx(safe, account),
    );
    await txResp.wait();

    expect(await safe.getAccountMerkleRoot(account.ref)).to.eq(
      ethers.utils.formatBytes32String(''),
    );
  });
});
