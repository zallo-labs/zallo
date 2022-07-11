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
  MultiExecutor,
  MultiExecutor__factory,
  toSafeConstructorDeployArgsBytes,
  getRandomDeploySalt,
} from 'lib';
import { allSigners, wallet } from './wallet';
import { ContractTransaction } from 'ethers';
import * as zk from 'zksync-web3';
import { parseEther } from 'ethers/lib/utils';

const SAFE_START_BALANCE = parseEther('0.000001');

export const toSafeGroupTest = (...approvers: [string, number][]): Group => ({
  ref: randomGroupRef(),
  approvers: approvers.map(([addr, weight]) => ({
    addr: address(addr),
    weight,
  })),
});

export const deployer = new Deployer(hre, wallet);

export const deployFactory = async (
  contractName = 'Safe',
  feeToken?: Address,
): Promise<{
  factory: Factory;
  deployTx: ContractTransaction;
}> => {
  const safeArtifact = await deployer.loadArtifact(contractName);
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

export const deploy = async (weights: number[]) => {
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
    args: { group },
    factory,
  });

  const txResp = await wallet.sendTransaction({
    to: deployData.safe.address,
    value: SAFE_START_BALANCE,
  });
  await txResp.wait();

  return {
    ...deployData,
    factory,
    group,
    others,
  };
};

export const deployTestSafe = async (
  weights: number[] = [PERCENT_THRESHOLD],
) => {
  const approvers = allSigners.slice(0, weights.length);
  const others = allSigners.slice(weights.length);

  const group = toSafeGroupTest(
    ...approvers.map((approver, i): [string, number] => [
      approver.address,
      weights[i],
    ]),
  );

  const { factory } = await deployFactory('TestSafe');
  const deployArgsBytes = toSafeConstructorDeployArgsBytes({ group });

  const salt = getRandomDeploySalt();
  const addr = zk.utils.create2Address(
    factory.address,
    await factory._safeBytecodeHash(),
    salt,
    deployArgsBytes,
  );

  const deployTx = await factory.deploySafe(salt, deployArgsBytes);
  await deployTx.wait();

  const txResp = await wallet.sendTransaction({
    to: addr,
    value: SAFE_START_BALANCE,
  });
  await txResp.wait();

  return {
    safe: new TestSafe__factory().attach(addr).connect(wallet),
    group,
    others,
  };
};

export const deployMultiExecutor = async (
  feeToken?: Address,
): Promise<{
  executor: MultiExecutor;
  deployTx: ContractTransaction;
}> => {
  const artifact = await deployer.loadArtifact('MultiExecutor');
  const contract = await deployer.deploy(artifact, [], {
    customData: { feeToken },
  });
  await contract.deployed();

  return {
    executor: new MultiExecutor__factory()
      .attach(address(contract.address))
      .connect(wallet),
    deployTx: contract.deployTransaction,
  };
};
