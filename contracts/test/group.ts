import {
  percentToFixedWeight,
  fixedWeightToPercent,
  SafeEvent,
  hashGroup,
} from 'lib';

import {
  expect,
  deploy,
  GasLimit,
  createSignedTx,
  deployTestSafe,
  toSafeGroupTest,
  createSignedTxs,
} from './util';

describe('Group', () => {
  it('Hashes', async () => {
    const { safe, group } = await deployTestSafe();

    const expected = hashGroup(group);
    const actual = await safe.hashGroup(group.approvers);

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
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toSafeGroupTest([newApprover.address, 100]);

      const signedTx = await createSignedTx(safe, groupHash, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [
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
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toSafeGroupTest([newApprover.address, 100]);
      const newGroupHash = hashGroup(newGroup);

      const addSt = await createSignedTx(safe, groupHash, [approver], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [
          newGroup.approvers,
        ]),
      });

      const addTx = await safe
        .connect(approver)
        .execute(...addSt, { gasLimit: GasLimit.EXECUTE });
      await expect(addTx).to.emit(safe, SafeEvent.GroupAdded);

      const rmSt = await createSignedTx(safe, newGroupHash, [newApprover], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('removeGroup', [newGroupHash]),
      });

      const rmTx = await safe
        .connect(newApprover)
        .execute(...rmSt, { gasLimit: GasLimit.EXECUTE });
      await expect(rmTx).to.emit(safe, SafeEvent.GroupRemoved);
    });

    it('Group can be replaced', async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toSafeGroupTest([newApprover.address, 100]);

      const st = await createSignedTxs(
        safe,
        groupHash,
        [approver],
        [
          // Add new group
          {
            to: safe.address,
            data: safe.interface.encodeFunctionData('addGroup', [
              newGroup.approvers,
            ]),
          },
          // Remove old group
          {
            to: safe.address,
            data: safe.interface.encodeFunctionData('removeGroup', [groupHash]),
          },
        ],
      );

      const tx = await safe.connect(approver).multiExecute(...st, {
        gasLimit: GasLimit.MULTI_EXECUTE,
      });

      await expect(tx).to.emit(safe, SafeEvent.GroupAdded);
      await expect(tx).to.emit(safe, SafeEvent.GroupRemoved);
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
        .addGroup(newGroup.approvers, {
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
