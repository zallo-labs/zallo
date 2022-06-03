import { ethers } from 'ethers';
import { createOp, getDomain, hashOp, hashOps, Op } from 'lib';
import { deployTestSafe, expect, GasLimit, wallet } from './util';

describe('EIP712', () => {
  it('Domain separator', async () => {
    const { safe } = await deployTestSafe();

    const expected = ethers.utils._TypedDataEncoder.hashDomain(
      await getDomain(safe),
    );
    const actual = await safe.callStatic.domainSeparator();

    expect(actual).to.eq(expected);
  });

  it('hashOp', async () => {
    const { safe } = await deployTestSafe();

    const tx = createOp({ to: wallet.address });

    const expected = await hashOp(tx, safe);
    const actual = await safe.callStatic.hashOp(tx);

    expect(actual).to.eq(expected);
  });

  it('hashOps', async () => {
    const { safe } = await deployTestSafe();

    const op = createOp({ to: wallet.address });

    const expected = await hashOps([op], safe);
    const actual = await safe.callStatic.hashOps([op], {
      gasLimit: GasLimit.EXECUTE,
    });

    expect(actual).to.eq(expected);
  });
});
