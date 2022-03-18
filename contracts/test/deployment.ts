import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { hashGroup, toGroup } from "./util";

interface DeployOptions {
  ether?: string | BigNumber;
}

export const deploy = async (
  weights: number[],
  { ether }: DeployOptions = {},
) => {
  if (weights.length === 0) throw Error("len(weights) must be > 0");

  const priorBlock = await ethers.provider.getBlockNumber();

  const allSigners = await ethers.getSigners();
  const approvers = allSigners.slice(0, weights.length);
  const others = allSigners.slice(weights.length);
  const [deployer] = approvers;

  const SafeFactory = await ethers.getContractFactory("Safe");

  const group = toGroup(
    approvers.map((signer, i) => ({ signer, weight: weights[i] })),
  );

  const safe = await SafeFactory.connect(deployer).deploy(group);
  await safe.deployed();

  if (ether) {
    const allSigners = await ethers.getSigners();
    const donator = allSigners[allSigners.length - 1];

    await donator.sendTransaction({
      to: safe.address,
      value: typeof ether === "string" ? ethers.utils.parseEther(ether) : ether,
    });
  }

  return {
    safe,
    approvers,
    others,
    priorBlock,
    group,
    groupHash: hashGroup(group),
  };
};

describe("Deployment", async () => {
  it("Deploys", async () => {
    await deploy([100]);
  });
});
