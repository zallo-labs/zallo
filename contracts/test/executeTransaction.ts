import {
  createTx,
  hashTx,
  Tester,
  toTransactionRequest,
  toTransactionStruct,
} from 'lib';
import {
  expect,
  execute,
  deploy,
  deployer,
  provider as provider,
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
    const { safe, account, quorum } = await deploy();

    const tx = createTx({ to: wallet.address });
    const signers = await getSigners(safe, quorum, tx);
    const txReq = await toTransactionRequest(safe, tx, account, signers);

    const txResp = safe.executeTransaction(toTransactionStruct(txReq));

    await expect(txResp).to.be.reverted;
  });

  it('should successfully execute a transaction with a single approver', async () => {
    const { safe, account, quorum } = await deploy(1);

    const to = tester.address;
    const startingBalance = await provider.getBalance(to);

    const value = 1;
    const txResp = await execute(safe, account, quorum, {
      to,
      value,
    });
    await txResp.wait();

    expect(await provider.getBalance(to)).to.equal(startingBalance.add(value));
  });

  it('should successfully execute a transaction with mutliple approvers', async () => {
    const { safe, account, quorum } = await deploy(5);

    const tx = createTx({ to: wallet.address });

    const txResp = await execute(safe, account, quorum, tx);
    await txResp.wait();
  });

  it('should set the transaction as executed', async () => {
    const { safe, account, quorum } = await deploy();

    const tx = createTx({ to: tester.address });
    const txResp = await execute(safe, account, quorum, tx);
    await txResp.wait();

    expect(await safe.hasBeenExecuted(await hashTx(safe, tx))).to.be.true;
  });
});
