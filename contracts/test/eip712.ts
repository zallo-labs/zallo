import { ethers } from 'ethers';
import { createTx, getDomain, hashTx } from 'lib';
import { deployTestSafe, expect, toSafeTransaction, wallet } from './util';

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
    const { safe } = await deployTestSafe();

    const tx = createTx({ to: wallet.address });

    const expected = await hashTx(safe.address, tx);
    const actual = await safe.hashTx(toSafeTransaction(safe, tx));

    expect(actual).to.eq(expected);
  });
});
