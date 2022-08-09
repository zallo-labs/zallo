import { ethers } from 'ethers';
import { createRemoveGroupTx, AccountEvent } from 'lib';
import { deploy, deployTestAccount, execute, expect } from './util';

describe('RemoveWallet', () => {
  it('should successfully execute & emit event', async () => {
    const { account, wallet, quorum } = await deploy();

    const txResp = await execute(
      account,
      wallet,
      quorum,
      createRemoveGroupTx(account, wallet),
    );

    await expect(txResp).to.emit(account, AccountEvent.WalletRemoved);
  });

  it("should zero wallet's merkle root", async () => {
    const { account, wallet, quorum } = await deployTestAccount();

    const txResp = await execute(
      account,
      wallet,
      quorum,
      createRemoveGroupTx(account, wallet),
    );
    await txResp.wait();

    expect(await account.getWalletMerkleRoot(wallet.ref)).to.eq(
      ethers.utils.formatBytes32String(''),
    );
  });
});
