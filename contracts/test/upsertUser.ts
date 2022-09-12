import {
  User,
  createUpsertUserTx,
  getMerkleTree,
  AccountEvent,
  sortUserConfigs,
  sortAddresses,
} from 'lib';
import { deploy, expect, execute, deployTestAccount, allSigners } from './util';

const modifiedUser = (user: User): User => ({
  ...user,
  configs: sortUserConfigs([
    ...user.configs,
    {
      approvers: sortAddresses([allSigners[4].address, allSigners[5].address]),
    },
  ]),
});

describe('UpsertUser', () => {
  it('should successfully execute', async () => {
    const { account, user, config } = await deploy();

    await execute(
      account,
      user,
      config,
      createUpsertUserTx(account, modifiedUser(user)),
    );
  });

  it('should emit event', async () => {
    const { account, user, config } = await deploy();

    const txResp = await execute(
      account,
      user,
      config,
      createUpsertUserTx(account, modifiedUser(user)),
    );

    await expect(txResp).to.emit(account, AccountEvent.UserUpserted);
  });

  it('should generate the correct wallet merkle root', async () => {
    const { account, user } = await deployTestAccount();

    const expectedRoot = getMerkleTree(user).getHexRoot();
    const actual = await account.getUserMerkleRoot(user.addr);

    expect(actual).to.eq(expectedRoot);
  });

  it('should revert if called from an address other than the account', async () => {
    const { account, user } = await deploy();

    const tx = await account.upsertUser(modifiedUser(user), {
      gasLimit: 100_000,
    });

    await expect(tx.wait()).to.be.reverted; // AccountError.OnlyCallableByAccount
  });
});
