import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  deploySafe,
  getFactory,
  getSafe,
  TestSafe__factory,
  address,
  randomGroupId,
  Group,
  SafeConstructorArgs,
  toSafeConstructorDeployArgs,
  Factory,
  Address,
} from 'lib';
import { allSigners, wallet } from './wallet';
import { BytesLike, ContractTransaction } from 'ethers';

export const toSafeGroupTest = (...approvers: [string, number][]): Group => ({
  ref: randomGroupId(),
  approvers: approvers.map(([addr, weight]) => ({
    addr: address(addr),
    weight,
  })),
});

export const deployer = new Deployer(hre, wallet);

export const deployFactory = async (
  feeToken?: Address,
): Promise<{
  factory: Factory;
  deployTx: ContractTransaction;
}> => {
  const artifact = await deployer.loadArtifact('Factory');
  const contract = await deployer.deploy(artifact, [], feeToken);
  await contract.deployed();

  return {
    factory: getFactory(address(contract.address), wallet),
    deployTx: contract.deployTransaction,
  };
};

export const deploySafeDirect = async (
  args: SafeConstructorArgs,
  feeToken?: Address,
) => {
  const artifact = await deployer.loadArtifact('Safe');
  const contract = await deployer.deploy(
    artifact,
    toSafeConstructorDeployArgs(args),
    feeToken,
  );
  await contract.deployed();

  return {
    safe: getSafe(address(contract.address), wallet),
    deployTx: contract.deployTransaction,
  };
};

export const deploy = async (weights: number[], _salt?: BytesLike) => {
  if (!weights.length) throw Error('No weights provided');

  const approvers = allSigners.slice(0, weights.length);
  const others = allSigners.slice(weights.length);

  const group = toSafeGroupTest(
    ...approvers.map((approver, i): [string, number] => [
      approver.address,
      weights[i],
    ]),
  );

  const { factory } = await deployFactory();
  const deployData = await deploySafe({
    signer: allSigners[0],
    args: { group },
    factory,
    // salt,
  });

  return {
    ...deployData,
    deployer: wallet,
    factory,
    group,
    others,
  };
};

export const deployTestSafe = async (
  weights: number[] = [100],
  feeToken?: Address,
) => {
  const approvers = allSigners.slice(0, weights.length);
  const others = allSigners.slice(weights.length);

  const group = toSafeGroupTest(
    ...approvers.map((approver, i): [string, number] => [
      approver.address,
      weights[i],
    ]),
  );

  const artifact = await deployer.loadArtifact('TestSafe');
  const contract = await deployer.deploy(
    artifact,
    toSafeConstructorDeployArgs({ group }),
    feeToken,
  );
  await contract.deployed();

  return {
    safe: new TestSafe__factory().attach(contract.address).connect(wallet),
    deployTx: contract.deployTransaction,
    group,
    others,
  };
};
