import { expect } from 'chai';
import { Account, Approval, hashTx, TestRules } from 'lib';
import { deployProxy, WALLETS, getApprovals } from '../util';
import { defaultTx, deployTestRules } from '../util/rules';

describe('ApprovalsRule', () => {
  let account = {} as Account;
  let rules = {} as TestRules;
  const tx = defaultTx;
  let txHash: string;
  const approvers = new Set(WALLETS.slice(0, 2).map((signer) => signer.address));
  let approvals: Approval[];

  before(async () => {
    account = (await deployProxy({ nApprovers: 0 })).account;
    rules = await deployTestRules();
    txHash = await hashTx(tx, account);
    approvals = await getApprovals(account, approvers, tx);
  });

  it('succeed with no approvers', async () => {
    await expect(rules.verifyApprovers([], txHash, [])).to.not.be.rejected;
  });

  it('succeed when all approvers sign', async () => {
    await expect(
      rules.verifyApprovers(
        approvals.map((a) => a.signer),
        txHash,
        approvals.map((a) => a.signature),
      ),
    ).to.not.be.rejected;
  });

  it("revert when an approver doesn't sign", async () => {
    await expect(
      rules.verifyApprovers(
        approvals.map((a) => a.signer),
        txHash,
        [approvals[0].signature],
      ),
    ).to.be.rejected;
  });

  it("revert when an approvers's signature is incorrect", async () => {
    await expect(
      rules.verifyApprovers(
        approvals.map((a) => a.signer),
        txHash,
        [approvals[0].signature, '0xaa'],
      ),
    ).to.be.rejected;
  });
});
