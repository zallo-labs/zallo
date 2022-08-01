import { createTx } from 'lib';
import { deploy, execute, expect, wallet } from './util';

describe('validateTransaction', () => {
  it('should revert when the transaction has already been executed', async () => {
    const { safe, account, quorum } = await deploy();

    const tx = createTx({ to: wallet.address });
    const txResp = await execute(safe, account, quorum, tx);
    await txResp.wait();

    const replayedTxResp = execute(safe, account, quorum, tx);
    await expect(replayedTxResp).to.be.reverted;
  });
});
