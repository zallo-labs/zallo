import {
  Wallet,
  createUpsertWalletTx,
  getMerkleTree,
  AccountEvent,
  toQuorum,
  sortQuorums,
} from 'lib';
import { deploy, expect, execute, deployTestAccount, allSigners } from './util';

const newWallet = (wallet: Wallet): Wallet => ({
  ...wallet,
  quorums: sortQuorums([
    ...wallet.quorums,
    toQuorum([allSigners[4].address, allSigners[5].address]),
  ]),
});

describe('UpsertWallet', () => {
  it('should successfully execute', async () => {
    const { account, wallet, quorum } = await deploy();

    await execute(
      account,
      wallet,
      quorum,
      createUpsertWalletTx(account, newWallet(wallet)),
    );
  });

  it('should emit event', async () => {
    const { account, wallet, quorum } = await deploy();

    const txResp = await execute(
      account,
      wallet,
      quorum,
      createUpsertWalletTx(account, newWallet(wallet)),
    );

    await expect(txResp).to.emit(account, AccountEvent.WalletUpserted);
  });

  it('should generate the correct wallet merkle root', async () => {
    const { account, wallet } = await deployTestAccount();

    const expectedRoot = getMerkleTree(wallet).getHexRoot();
    expect(await account.getWalletMerkleRoot(wallet.ref)).to.eq(expectedRoot);
  });

  it('should revert if called from an address other than the account', async () => {
    const { account, wallet } = await deploy();

    const tx = await account.upsertWallet(
      wallet.ref,
      newWallet(wallet).quorums,
      {
        gasLimit: 100_000,
      },
    );

    await expect(tx.wait()).to.be.reverted; // AccountError.OnlyCallableByAccount
  });
});
