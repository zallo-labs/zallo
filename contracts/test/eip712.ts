import { ethers } from 'ethers';
import { address, createTx, getDomain, hashTx } from 'lib';
import { deployTestSafe, expect, toSafeTransaction, wallet } from './util';

describe('EIP712', () => {
  it('Domain separator', async () => {
    const { safe } = await deployTestSafe();

    const expected = ethers.utils._TypedDataEncoder.hashDomain(
      await getDomain(address(safe.address)),
    );
    const actual = await safe.callStatic.domainSeparator();

    expect(actual).to.eq(expected);
  });

  it('hashTx', async () => {
    const { safe } = await deployTestSafe();

    const tx = createTx({ to: wallet.address });

    const expected = await hashTx(address(safe.address), tx);
    const actual = await safe.callStatic.hashTx(toSafeTransaction(safe, tx));

    expect(actual).to.eq(expected);
  });
});
