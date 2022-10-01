import { createTx, hashTx } from 'lib';
import { expect, execute, deploy, device } from './util';

describe('hasBeenExecuted', () => {
  it('should show an executed tx hash as being executed', async () => {
    const { account, user, config } = await deploy();

    const tx = createTx({ to: device.address });
    const txResp = await execute(account, user, config, tx);
    await txResp.wait();

    const txHash = await hashTx(account, tx);
    expect(await account.hasBeenExecuted(txHash)).to.be.true;
  });

  it('should not show an unexecuted tx as being executed', async () => {
    const { account } = await deploy();

    const txHash = await hashTx(account, createTx({}));
    expect(await account.hasBeenExecuted(txHash)).to.be.false;
  });
});
