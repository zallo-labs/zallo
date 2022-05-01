import {
  percentToFixedWeight,
  fixedWeightToPercent,
  toGroup,
  SafeEvent,
  hashGroup,
} from 'lib';

import { expect, deploy, GasLimit, createSignedTx } from './util';

describe('Group', () => {
  it('Hashes', async () => {
    const { safe, group, groupHash } = await deploy([100]);

    const actualGroupHash = await safe.hashGroup(group);
    expect(actualGroupHash).to.eq(groupHash);
  });

  it('Group approver weights must sum to at least 100%', async () => {
    let rejected = false;
    try {
      await deploy([90, 9]);
    } catch (e) {
      rejected = true;
    }
    expect(rejected).to.be.true; // SafeError.TotalGroupWeightLessThan100Percent
  });

  describe('Weight conversion', () => {
    it('Whole number', async () => {
      const n = 70;
      expect(n).to.eq(fixedWeightToPercent(percentToFixedWeight(n)));
    });

    it('Decimal', async () => {
      const n = 35.25998833119;
      expect(n).to.eq(fixedWeightToPercent(percentToFixedWeight(n)));
    });
  });

  describe('Through proposal', () => {
    it('Group can be added', async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toGroup([newApprover.address, 100]);

      const signedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [newGroup]),
      });

      const execTx = await safe.connect(approver).execute(signedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });
      await expect(execTx).to.emit(safe, SafeEvent.GroupAdded);
    });

    it('Group can be removed', async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toGroup([newApprover.address, 100]);
      const newGroupHash = hashGroup(newGroup);

      const addNewGroupSignedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [newGroup]),
      });
      await safe.connect(approver).execute(addNewGroupSignedTx, groupHash, {
        gasLimit: GasLimit.EXECUTE,
      });

      const removeNewGroupSignedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('removeGroup', [newGroupHash]),
      });

      const removalTx = await safe
        .connect(newApprover)
        .execute(removeNewGroupSignedTx, newGroupHash, {
          gasLimit: GasLimit.EXECUTE,
        });
      await expect(removalTx).to.emit(safe, SafeEvent.GroupRemoved);
    });
  });

  describe('Direct calls', () => {
    it("Group can't be added", async () => {
      const {
        safe,
        approvers: [approver],
        others: [other],
      } = await deploy([100]);

      const newGroup = toGroup([other.address, 100]);
      const addGroupTx = await safe.connect(approver).addGroup(newGroup, {
        gasLimit: GasLimit.ADD_GROUP,
      });

      await expect(addGroupTx.wait()).to.be.rejected; // OnlyCallableBySafe
    });

    it("Group can't be removed", async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
      } = await deploy([100]);

      const removeGroupTx = await safe
        .connect(approver)
        .removeGroup(groupHash, {
          gasLimit: GasLimit.REMOVE_GROUP,
        });

      await expect(removeGroupTx.wait()).to.be.rejected; // OnlyCallableBySafe
    });
  });
});
