import {
  Account,
  createUpsertAccountTx,
  getMerkleTree,
  randomAccountRef,
  SafeEvent,
  toQuorum,
  toQuorums,
} from 'lib';
import {
  deploy,
  expect,
  execute,
  deployTestSafe,
  allSigners,
  wallet,
} from './util';

const newAccount = (account: Account): Account => ({
  ...account,
  quorums: toQuorums([
    ...account.quorums,
    toQuorum([allSigners[4].address, allSigners[5].address]),
  ]),
});

describe('UpsertAccount', () => {
  it('should successfully execute', async () => {
    const { safe, account, quorum } = await deploy();

    await execute(
      safe,
      account,
      quorum,
      createUpsertAccountTx(safe, newAccount(account)),
    );
  });

  it('should emit event', async () => {
    const { safe, account, quorum } = await deploy();

    const txResp = await execute(
      safe,
      account,
      quorum,
      createUpsertAccountTx(safe, newAccount(account)),
    );

    await expect(txResp).to.emit(safe, SafeEvent.AccountUpserted);
  });

  it('should generate the correct account merkle root', async () => {
    const { safe, account } = await deployTestSafe();

    const expectedRoot = getMerkleTree(account).getHexRoot();
    expect(await safe.getAccountMerkleRoot(account.ref)).to.eq(expectedRoot);
  });

  it('should revert if called from an address other than the safe', async () => {
    const { safe, account } = await deploy();

    const tx = await safe
      .connect(wallet)
      .upsertAccount(account.ref, newAccount(account).quorums, {
        gasLimit: 40_000,
      });

    await expect(tx.wait()).to.be.reverted; // SafeError.OnlyCallableBySafe
  });
});
