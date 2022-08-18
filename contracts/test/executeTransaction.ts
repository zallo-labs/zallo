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
  device,
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
    const { account, wallet, quorum } = await deploy();

    const tx = createTx({ to: device.address });
    const signers = await getSigners(account, quorum, tx);
    const txReq = await toTransactionRequest(account, tx, wallet, signers);

    const txResp = account.executeTransaction(toTransactionStruct(txReq));

    await expect(txResp).to.be.reverted;
  });

  it('should successfully execute a transaction with a single approver', async () => {
    const { account, wallet, quorum } = await deploy(1);

    const txResp = await execute(account, wallet, quorum, {
      to: device.address,
    });
    await txResp.wait();
  });

  it('should successfully execute a transaction with mutliple approvers', async () => {
    const { account, wallet, quorum } = await deploy(5);

    const tx = createTx({ to: device.address });

    const txResp = await execute(account, wallet, quorum, tx);
    await txResp.wait();
  });

  it('should set the transaction as executed', async () => {
    const { account, wallet, quorum } = await deploy();

    const tx = createTx({ to: tester.address });
    const txResp = await execute(account, wallet, quorum, tx);
    await txResp.wait();

    expect(await account.hasBeenExecuted(await hashTx(account, tx))).to.be.true;
  });
});
