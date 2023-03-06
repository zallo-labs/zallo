import { expect } from 'chai';
import { Account, Approval, hashTx, TestVerifiers, TestVerifiers__factory } from 'lib';
import { deploy, deployProxy, WALLETS, WALLET, getApprovals } from '../util';
import { defaultTx } from './util';

describe('ApproversVerifier', () => {
  let account = {} as Account;
  let verifiers = {} as TestVerifiers;
  const tx = defaultTx;
  let txHash: string;
  const approvers = new Set(WALLETS.slice(0, 2).map((signer) => signer.address));
  let approvals: Approval[];

  before(async () => {
    account = (await deployProxy({ nApprovers: 0 })).account;
    verifiers = TestVerifiers__factory.connect((await deploy('TestVerifiers')).address, WALLET);
    txHash = await hashTx(tx, account);
    approvals = await getApprovals(account, approvers, tx);
  });

  it('succeed with no approvers', async () => {
    await expect(verifiers.verifyApprovers([], txHash, [])).to.not.be.rejected;
  });

  it('succeed when all approvers sign', async () => {
    await expect(
      verifiers.verifyApprovers(
        approvals.map((a) => a.signer),
        txHash,
        approvals.map((a) => a.signature),
      ),
    ).to.not.be.rejected;
  });

  it("revert when an approver doesn't sign", async () => {
    await expect(
      verifiers.verifyApprovers(
        approvals.map((a) => a.signer),
        txHash,
        [approvals[0].signature],
      ),
    ).to.be.rejected;
  });

  it("revert when an approvers's signature is incorrect", async () => {
    await expect(
      verifiers.verifyApprovers(
        approvals.map((a) => a.signer),
        txHash,
        [approvals[0].signature, '0xaa'],
      ),
    ).to.be.rejected;
  });
});
