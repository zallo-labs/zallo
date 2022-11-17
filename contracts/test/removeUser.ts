import { ethers } from 'ethers';
import { createRemoveUserTx, AccountEvent } from 'lib';
import { deploy, deployTestAccount, execute, expect } from './util';

describe('RemoveUser', () => {
  it('should successfully execute & emit event', async () => {
    const { account, user, config } = await deploy();

    const txResp = await execute(account, user, config, createRemoveUserTx(account, user));

    await expect(txResp).to.emit(account, AccountEvent.UserRemoved);
  });

  it("should zero user's merkle root", async () => {
    const { account, user, config } = await deployTestAccount();

    const txResp = await execute(account, user, config, createRemoveUserTx(account, user));
    await txResp.wait();

    expect(await account.getUserMerkleRoot(user.addr)).to.eq(ethers.utils.formatBytes32String(''));
  });
});
