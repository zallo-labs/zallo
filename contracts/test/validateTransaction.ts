import { createTx } from 'lib';
import { deploy, execute, expect, device } from './util';

describe('validateTransaction', () => {
  it('should revert when the transaction has already been executed', async () => {
    const { account, user, config } = await deploy();

    const tx = createTx({ to: device.address });
    const txResp = await execute(account, user, config, tx);
    await txResp.wait();

    const replayedTxResp = execute(account, user, config, tx);
    await expect(replayedTxResp).to.be.reverted;
  });
});
