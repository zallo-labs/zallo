import { createTx, createTxSignature, hashTx, Tester } from 'lib';
import {
  expect,
  execute,
  deploy,
  deployer,
  provider as provider,
  toSafeTransaction,
  wallet,
  getSigners,
} from './util';

describe('executeTransaction', () => {
  let tester: Tester;
  before(async () => {
    const artifact = await deployer.loadArtifact('Tester');
    tester = (await deployer.deploy(artifact, [], {})) as Tester;
    await tester.deployed();
  });

  it('should revert when not called by the bootloader', async () => {
    const { safe, group } = await deploy([100]);

    const tx = createTx({ to: wallet.address });
    const signers = await getSigners(safe, group.approvers, tx);

    const txResp = safe.executeTransaction({
      ...toSafeTransaction(safe, tx),
      signature: createTxSignature(group, signers),
    });

    await expect(txResp).to.be.reverted;
  });

  it('should successfully execute a transaction with a single approver', async () => {
    const { safe, group } = await deploy([100]);

    const to = tester.address;
    const startingBalance = await provider.getBalance(to);

    const value = 1;
    const txResp = await execute(safe, group, group.approvers, {
      to,
      value,
    });
    await txResp.wait();

    expect(await provider.getBalance(to)).to.equal(startingBalance.add(value));
  });

  it('should successfully execute a transaction with mutliple approvers', async () => {
    const { safe, group } = await deploy([30, 20, 40, 10]);

    const tx = createTx({ to: wallet.address });

    const txResp = await execute(safe, group, group.approvers, tx);
    await txResp.wait();
  });

  it('should set the transaction as executed', async () => {
    const { safe, group } = await deploy([100]);

    const tx = createTx({ to: tester.address });
    const txResp = await execute(safe, group, group.approvers, tx);
    await txResp.wait();

    expect(await safe.hasBeenExecuted(await hashTx(safe, tx))).to.be.true;
  });
});
