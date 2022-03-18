import { ethers } from "hardhat";
import { deploy } from "./deployment";
import { createSignedTx } from "./execution";
import {
  compareAddresses,
  expect,
  hashGroup,
  toGroup,
} from "./util";
import { SafeError } from "../utils/errors";
import { percentToFixedWeight, fixedWeightToPercent } from "../utils/group";

describe("Group", () => {
  it("Hashes", async () => {
    const { safe, group, groupHash } = await deploy([100]);

    const actualGroupHash = await safe.hashGroup(group);
    expect(actualGroupHash).to.eq(groupHash);
  });

  it("Group approver weights must sum to at least 100%", async () => {
    const [approver1, approver2] = await ethers.getSigners();

    const SafeFactory = await ethers.getContractFactory("Safe");
    const safeDeployment = SafeFactory.connect(approver1).deploy(
      [
        { addr: approver1.address, weight: percentToFixedWeight(90) },
        { addr: approver2.address, weight: percentToFixedWeight(9) },
      ].sort((a, b) => compareAddresses(a.addr, b.addr))
    );

    expect(safeDeployment).to.eventually.be.rejectedWith(
      SafeError.TotalGroupWeightLessThan100Percent
    );
  });

  it("Weight percentage conversion", async () => {
    const weight35 = percentToFixedWeight(35);
    expect(weight35).to.eq(percentToFixedWeight(fixedWeightToPercent(weight35)));

    const weight100 = percentToFixedWeight(100);
    expect(weight100).to.eq(percentToFixedWeight(fixedWeightToPercent(weight100)));
  });

  describe("Through proposal", () => {
    it("Group can be added", async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toGroup([{ signer: newApprover, weight: 100 }]);

      const signedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData("addGroup", [newGroup]),
      });

      await safe.connect(approver).execute(signedTx, groupHash);

      // TODO: check group was added
    });

    it("Group can be removed", async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
        others: [newApprover],
      } = await deploy([100]);

      const newGroup = toGroup([{ signer: newApprover, weight: 100 }]);
      const newGroupHash = hashGroup(newGroup);

      const addNewGroupSignedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData("addGroup", [newGroup]),
      });
      await safe.connect(approver).execute(addNewGroupSignedTx, groupHash);

      const removeNewGroupSignedTx = await createSignedTx(safe, [], {
        to: safe.address,
        data: safe.interface.encodeFunctionData("removeGroup", [newGroupHash]),
      });
      await safe
        .connect(newApprover)
        .execute(removeNewGroupSignedTx, newGroupHash);

      // TODO: check group is no longer valid
    });
  });

  describe("Direct calls", () => {
    it("Group can't be added", async () => {
      const {
        safe,
        approvers: [approver],
        others: [other],
      } = await deploy([100]);

      const newGroup = toGroup([{ signer: other, weight: 100 }]);
      const addGroupTx = safe.connect(approver).addGroup(newGroup);

      expect(addGroupTx).to.eventually.be.rejectedWith(SafeError.NotSafe);
    });

    it("Group can't be removed", async () => {
      const {
        safe,
        groupHash,
        approvers: [approver],
      } = await deploy([100]);

      const removeGroupTx = safe.connect(approver).removeGroup(groupHash);
      expect(removeGroupTx).to.eventually.be.rejectedWith(SafeError.NotSafe);
    });
  });
});
