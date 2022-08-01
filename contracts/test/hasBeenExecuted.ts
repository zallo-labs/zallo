import { createTx, hashTx } from 'lib';
import { expect, execute, deploy, wallet } from './util';

describe('hasBeenExecuted', () => {
  it('should show an executed tx hash as being executed', async () => {
    const { safe, account, quorum } = await deploy();

    const tx = createTx({ to: wallet.address });
    const txResp = await execute(safe, account, quorum, tx);
    await txResp.wait();

    const txHash = await hashTx(safe, tx);
    expect(await safe.hasBeenExecuted(txHash)).to.be.true;
  });

  it('should not show an unexecuted tx as being executed', async () => {
    const { safe } = await deploy();

    const txHash = await hashTx(safe, createTx({}));
    expect(await safe.hasBeenExecuted(txHash)).to.be.false;
  });
});
