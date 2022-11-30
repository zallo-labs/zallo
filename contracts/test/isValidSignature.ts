import { BigNumber } from 'ethers';
import { createTx, createUserSignature, hashTx } from 'lib';
import { expect, deploy, getSigners, device } from './util';

describe('isValidSignature', () => {
  it('should return the magic value if the signature is valid', async () => {
    const { account, user, config } = await deploy();

    const tx = createTx({ to: device.address });
    const txHash = await hashTx(tx, account);

    const signers = await getSigners(account, user, config, tx);
    const txSignature = createUserSignature(user, signers);

    const isValid = await account.isValidSignature(txHash, txSignature);

    expect(isValid).to.eq('0x1626ba7e');
  });

  it("should be reverted if the hash doesn't match the signature", async () => {
    const { account, user, config } = await deploy();

    const tx = createTx({ to: device.address });
    const signers = await getSigners(account, user, config, tx);
    const userSignature = createUserSignature(user, signers);

    const otherTx = createTx({ value: BigNumber.from(1) });
    const otherTxHash = await hashTx(otherTx, account);

    const validTxCheck = account.isValidSignature(otherTxHash, userSignature);

    await expect(validTxCheck).to.be.reverted;
  });
});
