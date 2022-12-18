import { expect } from 'chai';
import { ethers } from 'ethers';
import { toTx, toTxSignature, hashTx, Quorum, getDomain } from 'lib';
import { gasLimit, getSigners, DeployTesterProxyData, deployTesterProxy } from './util';

describe('Signature validation', () => {
  let { account, quorum } = {} as DeployTesterProxyData;
  before(async () => ({ account, quorum } = await deployTesterProxy()));

  it('should use the correct domain separator', async () => {
    expect(await account.domainSeparator()).to.eq(
      ethers.utils._TypedDataEncoder.hashDomain(await getDomain(account)),
    );
  });

  it('should return the EIP1271 magic value', async () => {
    const tx = toTx({});
    const hash = await hashTx(tx, account);
    const signature = toTxSignature(quorum, await getSigners(account, quorum, tx));

    expect(await account.isValidSignature(hash, signature, { gasLimit })).to.eq('0x1626ba7e');
  });

  it("should revert if the hash doesn't match the signature", async () => {
    const hash = await hashTx(toTx({}), account);
    const signature = toTxSignature(quorum, await getSigners(account, quorum, toTx({})));

    await expect(account.isValidSignature(hash, signature, { gasLimit })).to.be.reverted;
  });

  it("should revert if the signature quorum doesn't match the stored hash", async () => {
    const tx = toTx({});
    const hash = await hashTx(tx, account);

    const badQuorum: Quorum = { ...quorum, approvers: new Set([[...quorum.approvers][0]]) };
    const signature = toTxSignature(badQuorum, await getSigners(account, badQuorum, tx));

    await expect(account.isValidSignature(hash, signature, { gasLimit })).to.be.reverted;
  });
});
