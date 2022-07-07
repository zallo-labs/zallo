import { BigNumber } from 'ethers';
import { createTx, createTxSignature, hashTx } from 'lib';
import { expect, deploy, getSigners, wallet } from './util';

describe('isValidSignature', () => {
  it('should return the magic value if the signature is valid', async () => {
    const { safe, group } = await deploy([50, 50]);

    const tx = createTx({});
    const txHash = await hashTx(safe.address, tx);

    const signers = await getSigners(safe, group.approvers, tx);
    const txSignature = createTxSignature(group, signers);

    const isValid = await safe
      .connect(wallet)
      .isValidSignature(txHash, txSignature);

    expect(isValid).to.eq('0x1626ba7e');
  });

  it("should be reverted if the hash doesn't match the signature", async () => {
    const { safe, group } = await deploy([50, 50]);

    const tx = createTx({});
    const signers = await getSigners(safe, group.approvers, tx);
    const txSignature = createTxSignature(group, signers);

    const otherTx = createTx({ value: BigNumber.from(1) });
    const otherTxHash = await hashTx(safe.address, otherTx);

    const validTxCheck = safe
      .connect(wallet)
      .isValidSignature(otherTxHash, txSignature);

    await expect(validTxCheck).to.be.reverted;
  });

  it("should be reverted if the signers don't meet the threshold", async () => {
    const { safe, group } = await deploy([50, 50]);

    const tx = createTx({});
    const txHash = await hashTx(safe.address, tx);

    const insufficientSigners = await getSigners(
      safe,
      [group.approvers[0]],
      tx,
    );
    const insufficientTxSignature = createTxSignature(
      group,
      insufficientSigners,
    );

    const validTxCheck = safe
      .connect(wallet)
      .isValidSignature(txHash, insufficientTxSignature);

    await expect(validTxCheck).to.be.reverted;
  });
});
