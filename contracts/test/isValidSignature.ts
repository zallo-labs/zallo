import { BigNumber } from 'ethers';
import { createTx, createTxSignature, hashTx } from 'lib';
import { expect, deploy, getSigners, device } from './util';

describe('isValidSignature', () => {
  it('should return the magic value if the signature is valid', async () => {
    const { account, wallet, quorum } = await deploy();

    const tx = createTx({ to: device.address });
    const txHash = await hashTx(account.address, tx);

    const signers = await getSigners(account, quorum, tx);
    const txSignature = createTxSignature(wallet, signers);

    const isValid = await account
      .connect(device)
      .isValidSignature(txHash, txSignature);

    expect(isValid).to.eq('0x1626ba7e');
  });

  it("should be reverted if the hash doesn't match the signature", async () => {
    const { account, wallet, quorum } = await deploy();

    const tx = createTx({ to: device.address });
    const signers = await getSigners(account, quorum, tx);
    const txSignature = createTxSignature(wallet, signers);

    const otherTx = createTx({ value: BigNumber.from(1) });
    const otherTxHash = await hashTx(account.address, otherTx);

    const validTxCheck = account
      .connect(device)
      .isValidSignature(otherTxHash, txSignature);

    await expect(validTxCheck).to.be.reverted;
  });
});
