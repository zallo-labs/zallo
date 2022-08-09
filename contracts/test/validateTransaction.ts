import { createTx } from 'lib';
import { deploy, execute, expect, device } from './util';

describe('validateTransaction', () => {
  it('should revert when the transaction has already been executed', async () => {
    const { account, wallet, quorum } = await deploy();

    const tx = createTx({ to: device.address });
    const txResp = await execute(account, wallet, quorum, tx);
    await txResp.wait();

    const replayedTxResp = execute(account, wallet, quorum, tx);
    await expect(replayedTxResp).to.be.reverted;
  });
});
