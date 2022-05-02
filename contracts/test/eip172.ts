import { ethers } from 'ethers';
import { createTx, getDomain, hashTx } from 'lib';
import { deployTestSafe, expect, wallet } from './util';

describe('EIP712', () => {
  it('Domain separator', async () => {
    const { safe } = await deployTestSafe();

    const expected = ethers.utils._TypedDataEncoder.hashDomain(
      await getDomain(safe),
    );
    const actual = await safe.callStatic.domainSeparator();

    expect(actual).to.eq(expected);
  });

  it('txHash', async () => {
    const { safe } = await deployTestSafe();

    const tx = createTx({
      to: wallet.address,
    });

    const expected = await hashTx(tx, safe);
    const actual = await safe.callStatic.hashTx(tx);

    expect(actual).to.eq(expected);
  });
});
