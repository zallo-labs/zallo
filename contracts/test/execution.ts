import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Safe } from "typechain";
import { deploy } from "./deployment";
import { expect } from "./util";
import { EIP712_TX_TYPE, SignedTx, Tx } from "../utils/transaction";
import { SafeError } from "../utils/errors";

export const getDomain = async (safe: Safe) => ({
  chainId: (await ethers.provider.getNetwork()).chainId,
  verifyingContract: safe.address,
});

export const signTransaction = async (
  safe: Safe,
  tx: Tx,
  signers: SignerWithAddress[]
): Promise<string[]> => {
  const domain = await getDomain(safe);

  const signatures = await Promise.all(
    signers.map((signer) => signer._signTypedData(domain, EIP712_TX_TYPE, tx))
  );

  // Sort signatures by their hash
  return signatures.sort((a, b) =>
    ethers.utils.keccak256(a).localeCompare(ethers.utils.keccak256(b))
  );
};

export const createTx = (tx: Partial<Tx>): Tx => ({
  to: "0x0000000000000000000000000000000000000000",
  value: 0,
  data: [],
  nonce: 0, // TODO: generated random number
  ...tx,
});

export const createSignedTx = async (
  safe: Safe,
  signers: SignerWithAddress[],
  txOpts: Partial<Tx>
): Promise<SignedTx> => {
  const tx = createTx(txOpts);
  const signatures = await signTransaction(safe, tx, signers);
  return { tx, signatures };
};

describe("Execution", () => {
  describe("EIP712", () => {
    it("Domain separator", async () => {
      const { safe, approvers } = await deploy([100], {
        ether: "1",
      });
      const [signer] = approvers;

      const domain = await getDomain(safe);
      const domainSeparator = ethers.utils._TypedDataEncoder.hashDomain(domain);

      expect(await safe.connect(signer).domainSeparator()).to.eq(
        domainSeparator
      );
    });

    it("Tx hash", async () => {
      const { safe, approvers } = await deploy([100]);
      const [signer] = approvers;

      const tx = createTx({
        to: signer.address,
      });

      const txHash = ethers.utils._TypedDataEncoder.hash(
        await getDomain(safe),
        EIP712_TX_TYPE,
        tx
      );

      expect(await safe.connect(signer).hashTx(tx)).to.eq(txHash);
    });
  });

  describe("Valid", () => {
    it("Execution succeeds with sufficient approval when there's 1 approver", async () => {
      const value = ethers.utils.parseEther("1");

      const { safe, approvers, groupHash } = await deploy([100], {
        ether: value,
      });
      const [signer] = approvers;

      const signedTx = await createSignedTx(safe, approvers, {
        to: signer.address,
        value,
      });

      const exec = await safe.connect(signer).execute(signedTx, groupHash);

      // await expect(execTx).to.changeEtherBalance(signer.address, value); // FIXME:
    });

    it("Execution succeeds with sufficient approvals when there's multiple approvers", async () => {
      const { safe, approvers, groupHash } = await deploy([50, 25, 25]);
      const [receiver] = approvers;

      const signedTx = await createSignedTx(safe, approvers, {
        to: receiver.address,
      });

      await safe.connect(receiver).execute(signedTx, groupHash);
    });

    it("A non-approver can execute as long as they have the signatures", async () => {
      const { safe, approvers, groupHash } = await deploy([100]);

      const allSigners = await ethers.getSigners();
      const nonApprover = allSigners[allSigners.length - 1];

      const signedTx = await createSignedTx(safe, approvers, {
        to: nonApprover.address,
      });

      await safe.connect(nonApprover).execute(signedTx, groupHash);
    });

    it("Total approval weightings can be >100%", async () => {
      // TODO:
    });

    it("A primary approver can directly execute a transaction", async () => {
      const {
        safe,
        groupHash,
        approvers: [pa],
      } = await deploy([100]);

      const signedTx = await createSignedTx(safe, [], {});
      await safe.connect(pa).execute(signedTx, groupHash);
    });

    it("Batch execution with a single approver", async () => {
      const { safe, groupHash } = await deploy([100]);

      const signedTx = await createSignedTx(safe, [], {});

      await safe.batchExecute([signedTx, signedTx], groupHash);
    });

    it("Batched execution with multiple approvers", async () => {
      const { safe, approvers, groupHash } = await deploy([40, 40, 40]);

      // Use different data to generate a different txHash; remove this once random nonce gen is fixed!
      const signedTx1 = await createSignedTx(safe, approvers, { data: [1] });
      const signedTx2 = await createSignedTx(safe, approvers, { data: [2] });

      await safe.batchExecute([signedTx1, signedTx2], groupHash);
    });

    it("Batched transaction reverts if any reverts", async () => {
      const { safe, groupHash } = await deploy([100]);

      const signedTx1 = await createSignedTx(safe, [], {});
      const signedTx2 = await createSignedTx(safe, [], { value: 1 });

      const exec = safe.batchExecute([signedTx1, signedTx2], groupHash);
      expect(exec).to.eventually.be.rejectedWith(SafeError.ExecutionReverted);
    });
  });

  describe("Invalid", () => {
    it("Execution rejects when total approval weights <100%", async () => {
      const { safe, groupHash, approvers } = await deploy([50, 25, 25]);
      const [_, approver1, approver2] = approvers;

      const signedTx = await createSignedTx(safe, [approver1, approver2], {});

      const exec = safe.connect(approver1).execute(signedTx, groupHash);

      expect(exec).to.eventually.be.rejectedWith(
        SafeError.TotalApprovalWeightsInsufficient
      );
    });

    it("Only a primary approver can directly execute a transaction", async () => {
      const {
        safe,
        groupHash,
        approvers: [approver1, approver2],
      } = await deploy([70, 30]);

      const signedTx = await createSignedTx(safe, [], {});
      const execTx = safe.connect(approver1).execute(signedTx, groupHash);

      expect(execTx).to.eventually.be.rejectedWith(
        SafeError.NotPrimaryApprover
      );
    });
  });
});
