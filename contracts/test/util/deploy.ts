import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  connectFactory,
  address,
  Group,
  Address,
  randomGroupRef,
  Multicall,
  Multicall__factory,
  deploySafeProxy,
  PERCENT_THRESHOLD,
  TestSafe__factory,
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
  contractName: 'ERC1967Proxy',
  feeToken?: Address,
) => {
  const contractArtifact = await deployer.loadArtifact(contractName);
  const contractBytecodeHash = zk.utils.hashBytecode(contractArtifact.bytecode);

  const artifact = await deployer.loadArtifact('Factory');
  const contract = await deployer.deploy(
    artifact,
    [contractBytecodeHash],
    { customData: { feeToken } },
    [contractArtifact.bytecode],
  );
  await contract.deployed();

  return {
    factory: connectFactory(contract.address, wallet),
    deployTx: contract.deployTransaction,
  };
};

export const deploySafeImpl = async ({
  contractName = 'Safe',
  feeToken,
}: {
  contractName?: 'Safe' | 'TestSafe';
  feeToken?: Address;
} = {}) => {
  const artifact = await deployer.loadArtifact(contractName);
  const contract = await deployer.deploy(artifact, [], {
    customData: { feeToken },
  });
  await contract.deployed();

  return {
    impl: address(contract.address),
    deployTx: contract.deployTransaction,
  };
};

export const deploy = async (
  weights: number[] = [PERCENT_THRESHOLD],
  contractName: 'Safe' | 'TestSafe' = 'Safe',
) => {
  if (!weights.length) throw Error('No weights provided');

  const approvers = allSigners.slice(0, weights.length);
  const others = allSigners.slice(weights.length);

  const group = toSafeGroupTest(
    ...approvers.map((approver, i): [string, number] => [
      approver.address,
      weights[i],
    ]),
  );

  const { impl } = await deploySafeImpl({ contractName });
  const { factory } = await deployFactory('ERC1967Proxy');
  const deployData = await deploySafeProxy({ group, impl }, factory);

  const txResp = await wallet.sendTransaction({
    to: deployData.safe.address,
    value: SAFE_START_BALANCE,
  });
  await txResp.wait();

  return {
    ...deployData,
    impl,
    factory,
    group,
    others,
  };
};

export const deployTestSafe = async (weights?: number[]) => {
  const { safe, ...rest } = await deploy(weights, 'TestSafe');

  return {
    safe: TestSafe__factory.connect(safe.address, wallet),
    ...rest,
  };
};

export const deployMulticall = async (
  feeToken?: Address,
): Promise<{
  multicall: Multicall;
  deployTx: ContractTransaction;
}> => {
  const artifact = await deployer.loadArtifact('Multicall');
  const contract = await deployer.deploy(artifact, [], {
    customData: { feeToken },
  });
  await contract.deployed();

  return {
    multicall: new Multicall__factory()
      .attach(address(contract.address))
      .connect(wallet),
    deployTx: contract.deployTransaction,
  };
};
