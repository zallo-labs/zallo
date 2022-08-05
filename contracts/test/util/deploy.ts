import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  connectFactory,
  address,
  Address,
  Multicall,
  Multicall__factory,
  deploySafeProxy,
  TestSafe__factory,
  randomAccountRef,
  Account,
  toQuorums,
  toQuorum,
} from 'lib';
import { allSigners, wallet } from './wallet';
import { ContractTransaction } from 'ethers';
import * as zk from 'zksync-web3';
import { parseEther } from 'ethers/lib/utils';

const SAFE_START_BALANCE = parseEther('0.000001');

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
  quorumSize = 3,
  contractName: 'Safe' | 'TestSafe' = 'Safe',
) => {
  const approvers = allSigners
    .slice(0, quorumSize)
    .map((approver) => approver.address);
  const others = allSigners
    .slice(quorumSize)
    .map((approver) => approver.address);

  const quorum = toQuorum(approvers);

  const account: Account = {
    ref: randomAccountRef(),
    quorums: toQuorums([quorum]),
  };

  const { impl } = await deploySafeImpl({ contractName });
  const { factory } = await deployFactory('ERC1967Proxy');
  const deployData = await deploySafeProxy({ account, impl }, factory);

  const txResp = await wallet.sendTransaction({
    to: deployData.safe.address,
    value: SAFE_START_BALANCE,
  });
  await txResp.wait();

  return {
    ...deployData,
    impl,
    factory,
    account,
    quorum,
    others,
  };
};

export const deployTestSafe = async (quorumSize?: number) => {
  const { safe, ...rest } = await deploy(quorumSize, 'TestSafe');

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
    multicall: Multicall__factory.connect(contract.address, wallet),
    deployTx: contract.deployTransaction,
  };
};
