import { ethers } from 'ethers';
import { createOp, getDomain, hashTx } from 'lib';
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

  it('hashTx', async () => {
    const { safe } = await deployTestSafe();

    const tx = createOp({ to: wallet.address });

    const expected = await hashTx(safe, tx);
    const actual = await safe.callStatic.hashTx(tx);

    expect(actual).to.eq(expected);
  });

  it('hashMultiTx', async () => {
    const { safe } = await deployTestSafe();

    const op = createOp({ to: wallet.address });
    const ops = [op, op];

    const expected = await hashTx(safe, ...ops);
    const actual = await safe.callStatic.hashMultiTx(ops, {
      gasLimit: GasLimit.EXECUTE,
    });

    expect(actual).to.eq(expected);
  });
});
