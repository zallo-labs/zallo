import {
  percentToFixedWeight,
  fixedWeightToPercent,
  SafeEvent,
  hashApprovers,
  randomGroupId,
} from 'lib';

import {
  expect,
  deploy,
  GasLimit,
  createSignedTx,
  toSafeGroupTest,
  deployTestSafe,
} from './util';

describe('Group', () => {
  it('Hashes', async () => {
    const { safe, group } = await deployTestSafe();

    const expected = hashApprovers(group);
    const actual = await safe.hashApprovers(group.approvers);

    expect(expected).to.eq(actual);
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
        groupId,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroupId = randomGroupId();
      const newGroup = toSafeGroupTest([newApprover.address, 100]);

      const signedTx = await createSignedTx(safe, groupId, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [
          newGroupId,
          newGroup.approvers,
        ]),
      });

      const execTx = await safe.connect(approver).execute(...signedTx, {
        gasLimit: GasLimit.EXECUTE,
      });
      await expect(execTx).to.emit(safe, SafeEvent.GroupAdded);
    });

    it('Group can be removed', async () => {
      const {
        safe,
        groupId,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toSafeGroupTest([newApprover.address, 100]);
      const newGroupId = randomGroupId();

      const addSt = await createSignedTx(safe, groupId, [approver], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [
          newGroupId,
          newGroup.approvers,
        ]),
      });

      const addTx = await safe
        .connect(approver)
        .execute(...addSt, { gasLimit: GasLimit.EXECUTE });
      await expect(addTx).to.emit(safe, SafeEvent.GroupAdded);

      const rmSt = await createSignedTx(safe, newGroupId, [newApprover], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('removeGroup', [
          newGroupId,
          newGroup.approvers,
        ]),
      });

      const rmTx = await safe
        .connect(newApprover)
        .execute(...rmSt, { gasLimit: GasLimit.EXECUTE });
      await expect(rmTx).to.emit(safe, SafeEvent.GroupRemoved);
    });

    it('Group can be replaced', async () => {
      const {
        safe,
        group,
        groupId,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toSafeGroupTest([newApprover.address, 100]);
      const newGroupId = randomGroupId();

      const st = await createSignedTx(
        safe,
        groupId,
        [approver],
        [
          // Add new group
          {
            to: safe.address,
            data: safe.interface.encodeFunctionData('addGroup', [
              newGroupId,
              newGroup.approvers,
            ]),
          },
          // Remove old group
          {
            to: safe.address,
            data: safe.interface.encodeFunctionData('removeGroup', [
              groupId,
              group.approvers,
            ]),
          },
        ],
      );

      const tx = await safe.connect(approver).multiExecute(...st, {
        gasLimit: GasLimit.MULTI_EXECUTE,
      });

      await expect(tx).to.emit(safe, SafeEvent.GroupAdded);
      await expect(tx).to.emit(safe, SafeEvent.GroupRemoved);
    });

    it('Group can be updated', async () => {
      const {
        safe,
        group,
        groupId,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newApprovers = toSafeGroupTest(
        [approver.address, 50],
        [newApprover.address, 50],
      ).approvers;

      const st = await createSignedTx(safe, groupId, [approver], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('updateGroup', [
          groupId,
          group.approvers,
          newApprovers,
        ]),
      });

      const tx = await safe.connect(approver).execute(...st, {
        gasLimit: GasLimit.MULTI_EXECUTE,
      });

      await expect(tx).to.emit(safe, SafeEvent.GroupUpdated);
    });
  });

  describe('Direct calls', () => {
    it("Group can't be added", async () => {
      const {
        safe,
        approvers: [approver],
        others: [other],
      } = await deploy([100]);

      const newGroup = toSafeGroupTest([other.address, 100]);
      const addGroupTx = await safe
        .connect(approver)
        .addGroup(randomGroupId(), newGroup.approvers, {
          gasLimit: GasLimit.ADD_GROUP,
        });

      await expect(addGroupTx.wait()).to.be.rejected; // OnlyCallableBySafe
    });

    it("Group can't be removed", async () => {
      const {
        safe,
        groupHash,
        group,
        approvers: [approver],
      } = await deploy([100]);

      const removeGroupTx = await safe
        .connect(approver)
        .removeGroup(groupHash, group.approvers, {
          gasLimit: GasLimit.REMOVE_GROUP,
        });

      await expect(removeGroupTx.wait()).to.be.rejected; // OnlyCallableBySafe
    });
  });
});
