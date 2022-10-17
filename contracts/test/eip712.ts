import { ethers } from 'ethers';
import {
  createTx,
  getDomain,
  hashTx,
  toTransactionRequest,
  toTransactionStruct,
} from 'lib';
import { deployTestAccount, expect, getSigners, device } from './util';

describe('EIP712', () => {
  it.only('Domain separator', async () => {
    await deployTestAccount();
    // const { account } = await deployTestAccount();

    // const expected = ethers.utils._TypedDataEncoder.hashDomain(
    //   await getDomain(account),
    // );
    // const actual = await account.domainSeparator();

    // expect(actual).to.eq(expected);
  });

  it('hashTx', async () => {
    const { account, user, config } = await deployTestAccount();

    const tx = createTx({ to: device.address });
    const txReq = await toTransactionRequest(
      account,
      tx,
      user,
      await getSigners(account, user, config, tx),
    );

    const expected = await hashTx(account, tx);
    const actual = await account.hashTx(toTransactionStruct(txReq));

    expect(actual).to.eq(expected);
  });
});
