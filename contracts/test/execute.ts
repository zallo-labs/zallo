import { createOp, executeTx, SafeEvent, signTx } from 'lib';
import { expect, execute, deploy, allSigners } from './util';

describe('Execute', () => {
  it('should succeed when approval weights reach threshold', async () => {
    const { safe, group } = await deploy([50, 50]);

    const tx = await execute(safe, group, group.approvers, {
      to: safe.address,
    });

    await tx.wait();
    await expect(tx).to.emit(safe, SafeEvent.Transaction);
  });

  it('should be reverted when tx has been executed before', async () => {
    const { safe, group } = await deploy([50, 50]);

    const op = createOp({ to: safe.address });
    const tx = await execute(safe, group, group.approvers, op);

    await tx.wait();
    await expect(tx).to.emit(safe, SafeEvent.Transaction);

    const tx2 = await execute(safe, group, group.approvers, op);
    await expect(tx2.wait()).to.be.reverted; // SafeError.TransactionAlreadyExecuted
  });

  it("should be reverted when a signature doesn't match an approver", async () => {
    const { safe, group } = await deploy([50, 50]);

    const op = createOp({ to: safe.address });
    const tx = await executeTx(safe, op, group, [
      {
        ...group.approvers[0],
        signature: await signTx(allSigners[5], safe.address, op),
      },
    ]);

    await expect(tx.wait()).to.be.reverted; // SafeError.InvalidSignature
  });

  it('should be reverted when approval does not meet threshold', async () => {
    const { safe, group } = await deploy([50, 50]);

    const tx = await execute(safe, group, [group.approvers[0]], {
      to: safe.address,
    });

    await expect(tx.wait()).to.be.reverted; // SafeError.BelowThreshold
  });

  it('should be reverted when proof is invalid', async () => {
    const { safe, group: invalidGroup } = await deploy([100, 50]);

    invalidGroup.approvers[1].weight = 100;
    const tx = await execute(safe, invalidGroup, [invalidGroup.approvers[0]], {
      to: safe.address,
    });

    await expect(tx.wait()).to.be.reverted; // SafeError.InvalidProof
  });
});
