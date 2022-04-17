import { ethers } from 'hardhat';
import { createSignedTx } from './execution';
import {
  percentToFixedWeight,
  fixedWeightToPercent,
  SafeError,
  toGroup,
  SafeEvent,
  hashGroup,
} from 'lib';

import { expect } from './util';
import { deploy } from './deployer';

describe('Group', () => {
  it('Hashes', async () => {
    const { safe, group, groupHash } = await deploy([100]);

    const actualGroupHash = await safe.hashGroup(group);
    expect(actualGroupHash).to.eq(groupHash);
  });

  it('Group approver weights must sum to at least 100%', async () => {
    const [approver1, approver2] = await ethers.getSigners();

    const SafeFactory = await ethers.getContractFactory('Safe');
    const safeDeployment = SafeFactory.connect(approver1).deploy(
      toGroup([approver1.address, 90], [approver2.address, 9]),
    );

    expect(safeDeployment).to.eventually.be.rejectedWith(
      SafeError.TotalGroupWeightLessThan100Percent,
    );
  });

  it('Weight percentage conversion', async () => {
    const weight35 = percentToFixedWeight(35);
    expect(weight35).to.eq(
      percentToFixedWeight(fixedWeightToPercent(weight35)),
    );

    const weight100 = percentToFixedWeight(100);
    expect(weight100).to.eq(
      percentToFixedWeight(fixedWeightToPercent(weight100)),
    );
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

      const execTx = await safe.connect(approver).execute(signedTx, groupHash);
      expect(execTx).to.emit(safe, SafeEvent.GroupAdded);
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
      await safe.connect(approver).execute(addNewGroupSignedTx, groupHash);

      const removeNewGroupSignedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData('removeGroup', [newGroupHash]),
      });

      const removalTx = await safe
        .connect(newApprover)
        .execute(removeNewGroupSignedTx, newGroupHash);
      expect(removalTx).to.emit(safe, SafeEvent.GroupRemoved);
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

      const addGroupTx = safe.connect(approver).addGroup(newGroup);
      expect(addGroupTx).to.eventually.be.rejectedWith(
        SafeError.OnlyCallableBySafe,
      );
    });

    it("Group can't be removed", async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
      } = await deploy([100]);

      const removeGroupTx = safe.connect(approver).removeGroup(groupHash);
      expect(removeGroupTx).to.eventually.be.rejectedWith(
        SafeError.OnlyCallableBySafe,
      );
    });
  });
});
