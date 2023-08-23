import { expect } from 'chai';
import {
  APPROVALS_ABI,
  Account,
  ApprovalsParams,
  POLICY_ABI,
  TestVerifier,
  asPolicy,
  hashTx,
  zeroHexBytes,
} from 'lib';
import { deployProxy, WALLETS, getApprovals, WALLET } from './util';
import { defaultTx, deployTestVerifier } from './util/verifier';

describe('ApprovalsVerifier', () => {
  let account = {} as Account;
  let verifier = {} as TestVerifier;
  const tx = defaultTx;
  let txHash: string;
  let approvalsInput = {} as ApprovalsParams;

  const policy = asPolicy({
    key: 1,
    approvers: new Set(WALLETS.slice(0, 2).map((signer) => signer.address)),
  });

  before(async () => {
    account = (await deployProxy({ nApprovers: 0 })).account;
    verifier = await deployTestVerifier();
    txHash = hashTx(account.address, tx);
    approvalsInput = {
      approvers: policy.approvers,
      approvals: await getApprovals(account, policy.approvers, tx),
    };
  });

  it('succeeds with no approvers', async () => {
    expect(
      await verifier.verifyApprovals(
        APPROVALS_ABI.asStruct({ approvals: [], approvers: new Set() }),
        txHash,
        POLICY_ABI.asStruct(asPolicy({ key: 1, approvers: [] })),
      ),
    ).to.be.true;
  });

  it('succeeds when all approvers sign', async () => {
    expect(
      await verifier.verifyApprovals(
        APPROVALS_ABI.asStruct(approvalsInput),
        txHash,
        POLICY_ABI.asStruct(policy),
      ),
    ).to.be.true;
  });

  it("fails when an approver doesn't sign", async () => {
    expect(
      await verifier.verifyApprovals(
        APPROVALS_ABI.asStruct({ ...approvalsInput, approvals: [approvalsInput.approvals[0]!] }),
        txHash,
        POLICY_ABI.asStruct(policy),
      ),
    ).to.be.false;
  });

  it("revert when an approvers's signature is incorrect", async () => {
    await expect(
      verifier.verifyApprovals(
        APPROVALS_ABI.asStruct({
          ...approvalsInput,
          approvals: [
            approvalsInput.approvals[0]!,
            {
              ...approvalsInput.approvals[1]!,
              signature: approvalsInput.approvals[0]!.signature,
            },
          ],
        }),
        txHash,
        POLICY_ABI.asStruct(policy),
      ),
    ).to.be.rejected;
  });
});
