import { ethers } from 'ethers';
import {
  createTx,
  getDomain,
  hashTx,
  toTransactionRequest,
  toTransactionStruct,
} from 'lib';
import { deployTestSafe, expect, getSigners, wallet } from './util';

describe('EIP712', () => {
  it('Domain separator', async () => {
    const { safe } = await deployTestSafe();

    const expected = ethers.utils._TypedDataEncoder.hashDomain(
      await getDomain(safe),
    );
    const actual = await safe.domainSeparator();

    expect(actual).to.eq(expected);
  });

  it('hashTx', async () => {
    const { safe, account, quorum } = await deployTestSafe();

    const tx = createTx({ to: wallet.address });
    const txReq = await toTransactionRequest(
      safe,
      tx,
      account,
      await getSigners(safe, quorum, tx),
    );

    const expected = await hashTx(safe.address, tx);
    const actual = await safe.hashTx(toTransactionStruct(txReq));

    expect(actual).to.eq(expected);
  });
});
