import { createTx, toTransactionRequest, toTransactionStruct } from 'lib';
import {
  deploy,
  allSigners,
  provider,
  getSigners,
  wallet,
  expect,
} from './util';

describe('executeTransactionFromOutside', () => {
  it('should be callable from any address', async () => {
    const { safe, account, quorum } = await deploy();

    const to = allSigners[2].address;
    const value = 1;
    const tx = createTx({ to, value });
    const preBalance = await provider.getBalance(to);

    const signers = await getSigners(safe, quorum, tx);
    const txReq = await toTransactionRequest(safe, tx, account, signers);

    const txResp = await safe
      .connect(wallet)
      .executeTransactionFromOutside(toTransactionStruct(txReq));

    await txResp.wait();

    expect(await provider.getBalance(to)).to.eq(preBalance.add(value));
  });
});
