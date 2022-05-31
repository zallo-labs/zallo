import { ethers } from 'hardhat';
import {
  expect,
  deploy,
  deposit,
  wallet,
  GasLimit,
  createSignedTx,
} from './util';

describe('Execution', () => {
  describe('Valid', () => {
    it("Execution succeeds with sufficient approval when there's 1 approver", async () => {
      const { safe, approvers, groupHash } = await deploy([100]);
      const [signer] = approvers;

      const signedTx = await createSignedTx(safe, approvers, {
        to: signer.address,
      });

      await safe.connect(wallet).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });
    });

    it("Execution succeeds with sufficient approvals when there's multiple approvers", async () => {
      const { safe, approvers, groupHash } = await deploy([50, 25, 25]);
      const [receiver] = approvers;

      const signedTx = await createSignedTx(safe, approvers, {
        to: receiver.address,
      });

      await safe.connect(receiver).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });
    });

    it('A non-approver can execute as long as they have the signatures', async () => {
      const { safe, approvers, groupHash } = await deploy([100]);

      const allSigners = await ethers.getSigners();
      const nonApprover = allSigners[allSigners.length - 1];

      const signedTx = await createSignedTx(safe, approvers, {
        to: nonApprover.address,
      });

      await safe.connect(nonApprover).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });
    });

    it('Total approval weightings can be >100%', async () => {
      const value = ethers.utils.parseEther('1');

      const { safe, approvers, groupHash } = await deploy([50, 40, 40]);
      await deposit(safe, value);
      const [signer] = approvers;

      const signedTx = await createSignedTx(safe, approvers, {
        to: signer.address,
        value,
      });

      await safe.connect(signer).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });
    });

    it('A primary approver can directly execute a transaction', async () => {
      const {
        safe,
        groupHash,
        approvers: [pa],
      } = await deploy([100]);

      const signedTx = await createSignedTx(safe, [], {});
      await safe.connect(pa).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });
    });

    it('Batch execution with a single approver', async () => {
      const { safe, groupHash } = await deploy([100]);

      const signedTx = await createSignedTx(safe, [], {});

      await safe.batchExecute([signedTx, signedTx], groupHash, {
        gasLimit: GasLimit.BATCH_EXECUTE,
      });
    });

    it('Batched execution with multiple approvers', async () => {
      const { safe, approvers, groupHash } = await deploy([40, 40, 20]);

      // Use different data to generate a different txHash; remove this once random nonce gen is fixed!
      const signedTx1 = await createSignedTx(safe, approvers, { data: [1] });
      const signedTx2 = await createSignedTx(safe, approvers, { data: [2] });

      await safe.batchExecute([signedTx1, signedTx2], groupHash, {
        gasLimit: GasLimit.BATCH_EXECUTE,
      });
    });

    it('Batched transaction reverts if any reverts', async () => {
      const { safe, groupHash } = await deploy([100]);

      const signedTx1 = await createSignedTx(safe, [], {});
      const signedTx2 = await createSignedTx(safe, [], { value: 1 });

      const exec = await safe.batchExecute([signedTx1, signedTx2], groupHash, {
        gasLimit: GasLimit.BATCH_EXECUTE,
      });

      await expect(exec.wait()).to.be.reverted;
    });
  });

  describe('Invalid', () => {
    it('Execution rejects when total approval weights <100%', async () => {
      const { safe, groupHash, approvers } = await deploy([50, 25, 25]);
      const [approver1, approver2] = approvers;

      const signedTx = await createSignedTx(safe, [approver1, approver2], {});

      const execTx = await safe
        .connect(approver1)
        .execute(signedTx, groupHash, {
          gasLimit: GasLimit.EXECUTE,
        });

      await expect(execTx.wait()).to.be.reverted;
    });

    it('Only a primary approver can directly execute a transaction', async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
      } = await deploy([70, 30]);

      const signedTx = await createSignedTx(safe, [], {});
      const execTx = await safe.connect(approver).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });

      await expect(execTx.wait()).to.be.reverted;
    });
  });
});
