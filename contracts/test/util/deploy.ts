import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  deploySafe,
  getFactory,
  getSafe,
  TestSafe__factory,
  address,
  Group,
  SafeConstructorArgs,
  Factory,
  Address,
  randomGroupRef,
  toSafeConstructorDeployArgs,
  PERCENT_THRESHOLD,
} from 'lib';
import { allSigners, wallet } from './wallet';
import { BytesLike, ContractTransaction } from 'ethers';
import * as zk from 'zksync-web3';

export const toSafeGroupTest = (...approvers: [string, number][]): Group => ({
  ref: randomGroupRef(),
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
  const safeArtifact = await deployer.loadArtifact('Safe');
  const safeBytecodeHash = zk.utils.hashBytecode(safeArtifact.bytecode);

  const artifact = await deployer.loadArtifact('Factory');
  const contract = await deployer.deploy(
    artifact,
    [safeBytecodeHash],
    { customData: { feeToken } },
    [safeArtifact.bytecode],
  );
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
    { customData: { feeToken } },
  );
  await contract.deployed();

  return {
    safe: getSafe(contract.address),
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
  weights: number[] = [PERCENT_THRESHOLD],
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
    { customData: { feeToken } },
  );
  await contract.deployed();

  return {
    safe: new TestSafe__factory().attach(contract.address).connect(wallet),
    deployTx: contract.deployTransaction,
    group,
    others,
  };
};
