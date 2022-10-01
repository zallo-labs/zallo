import { createTx, toTransactionRequest, toTransactionStruct } from 'lib';
import { deploy, allSigners, provider, getSigners, expect } from './util';

describe('executeTransactionFromOutside', () => {
  it('should be callable from any address', async () => {
    const { account, user, config } = await deploy();

    const to = allSigners[2].address;
    const value = 1;
    const tx = createTx({ to, value });
    const preBalance = await provider.getBalance(to);

    const signers = await getSigners(account, user, config, tx);
    const txReq = await toTransactionRequest(account, tx, user, signers);

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
