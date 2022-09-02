import { createTx, toTransactionRequest, toTransactionStruct } from 'lib';
import { deploy, allSigners, provider, getSigners, expect } from './util';

describe('executeTransactionFromOutside', () => {
  it('should be callable from any address', async () => {
    const { account, wallet, quorum } = await deploy();

    const to = allSigners[2].address;
    const value = 1;
    const tx = createTx({ to, value });
    const preBalance = await provider.getBalance(to);

    const signers = await getSigners(account, quorum, tx);
    const txReq = await toTransactionRequest(account, tx, wallet, signers);

    const txResp = await account.executeTransactionFromOutside(
      toTransactionStruct(txReq),
      {
        gasLimit: 200_000,
      },
    );

    await txResp.wait();

    expect(await provider.getBalance(to)).to.eq(preBalance.add(value));
  });
});
