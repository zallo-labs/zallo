import { BigNumber } from 'ethers';
import { createTx, createTxSignature, hashTx } from 'lib';
import { expect, deploy, getSigners, wallet } from './util';

describe('isValidSignature', () => {
  it('should return the magic value if the signature is valid', async () => {
    const { safe, account, quorum } = await deploy();

    const tx = createTx({ to: wallet.address });
    const txHash = await hashTx(safe.address, tx);

    const signers = await getSigners(safe, quorum, tx);
    const txSignature = createTxSignature(account, signers);

    const isValid = await safe
      .connect(wallet)
      .isValidSignature(txHash, txSignature);

    expect(isValid).to.eq('0x1626ba7e');
  });

  it("should be reverted if the hash doesn't match the signature", async () => {
    const { safe, account, quorum } = await deploy();

    const tx = createTx({ to: wallet.address });
    const signers = await getSigners(safe, quorum, tx);
    const txSignature = createTxSignature(account, signers);

    const otherTx = createTx({ value: BigNumber.from(1) });
    const otherTxHash = await hashTx(safe.address, otherTx);

    const validTxCheck = safe
      .connect(wallet)
      .isValidSignature(otherTxHash, txSignature);

    await expect(validTxCheck).to.be.reverted;
  });
});
