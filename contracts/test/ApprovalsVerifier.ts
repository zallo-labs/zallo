import { expect } from 'chai';
import {
  Address,
  ApprovalsParams,
  Hex,
  Policy,
  UAddress,
  ZERO_ADDR,
  asPolicy,
  asTx,
  encodeApprovalsStruct,
  encodePolicyStruct,
  hashTx,
  TEST_VERIFIER_ABI,
} from 'lib';
import { deployProxy, getApprovals, network, deploy, wallets } from './util';

describe('ApprovalsVerifier', () => {
  let account: UAddress;
  let verifier: Address;
  const tx = asTx({ to: ZERO_ADDR, nonce: 0n });
  let txHash: Hex;
  let approvalsInput = {} as ApprovalsParams;

  const policy = asPolicy({
    key: 1,
    approvers: new Set(wallets.slice(0, 2).map((signer) => signer.address)),
  });

  before(async () => {
    account = (await deployProxy({ nApprovers: 0 })).account;
    verifier = (await deploy('TestVerifier')).address;
    txHash = hashTx(account, tx);
    approvalsInput = {
      approvers: policy.approvers,
      approvals: await getApprovals(account, policy.approvers, tx),
    };
  });

  const verify = (approvals: ApprovalsParams, policy: Policy) =>
    network.readContract({
      address: verifier,
      abi: TEST_VERIFIER_ABI,
      functionName: 'verifyApprovals',
      args: [encodeApprovalsStruct(approvals), txHash, encodePolicyStruct(policy)],
    });

  it('succeeds with no approvers', async () => {
    expect(
      await verify({ approvals: [], approvers: new Set() }, asPolicy({ key: 1, approvers: [] })),
    ).to.be.true;
  });

  it('succeeds when all approvers sign', async () => {
    expect(await verify(approvalsInput, policy)).to.be.true;
  });

  it("fails when an approver doesn't sign", async () => {
    expect(await verify({ ...approvalsInput, approvals: [approvalsInput.approvals[0]!] }, policy))
      .to.be.false;
  });

  it("revert when an approvers's signature is incorrect", async () => {
    await expect(
      verify(
        {
          ...approvalsInput,
          approvals: [
            approvalsInput.approvals[0]!,
            {
              ...approvalsInput.approvals[1]!,
              signature: approvalsInput.approvals[0]!.signature,
            },
          ],
        },
        policy,
      ),
    ).to.be.rejected;
  });
});
