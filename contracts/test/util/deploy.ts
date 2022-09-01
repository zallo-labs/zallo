import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  connectFactory,
  address,
  Multicall,
  deployAccountProxy,
  randomWalletRef,
  Wallet,
  toQuorum,
  sortQuorums,
  connectTestAccount,
  connectMulticall,
} from 'lib';
import { allSigners, device } from './wallet';
import { ContractTransaction } from 'ethers';
import * as zk from 'zksync-web3';
import { parseEther } from 'ethers/lib/utils';

const ACCOUNT_START_BALANCE = parseEther('0.00001');

export const deployer = new Deployer(hre, device);

export const deployFactory = async (contractName: 'ERC1967Proxy') => {
  const contractArtifact = await deployer.loadArtifact(contractName);
  const contractBytecodeHash = zk.utils.hashBytecode(contractArtifact.bytecode);

  const artifact = await deployer.loadArtifact('Factory');
  const contract = await deployer.deploy(artifact, [contractBytecodeHash], {}, [
    contractArtifact.bytecode,
  ]);
  await contract.deployed();

  return {
    factory: connectFactory(contract.address, device),
    deployTx: contract.deployTransaction,
  };
};

export const deployAccountImpl = async ({
  contractName = 'Account',
}: {
  contractName?: 'Account' | 'TestAccount';
} = {}) => {
  const artifact = await deployer.loadArtifact(contractName);
  const contract = await deployer.deploy(artifact);
  // await contract.deployed();

  return {
    impl: address(contract.address),
    deployTx: contract.deployTransaction,
  };
};

export const deploy = async (
  quorumSize = 3,
  contractName: 'Account' | 'TestAccount' = 'Account',
) => {
  const approvers = allSigners
    .slice(0, quorumSize)
    .map((approver) => approver.address);
  const others = allSigners
    .slice(quorumSize)
    .map((approver) => approver.address);

  const quorum = toQuorum(approvers);

  const wallet: Wallet = {
    ref: randomWalletRef(),
    quorums: sortQuorums([quorum]),
  };

  const { impl } = await deployAccountImpl({ contractName });
  const { factory } = await deployFactory('ERC1967Proxy');
  const deployData = await deployAccountProxy({ wallet, impl }, factory);

  const txResp = await device.sendTransaction({
    to: deployData.account.address,
    value: ACCOUNT_START_BALANCE,
  });
  await txResp.wait();

  return {
    ...deployData,
    impl,
    factory,
    wallet,
    quorum,
    others,
  };
};

export const deployTestAccount = async (quorumSize?: number) => {
  const { account, ...rest } = await deploy(quorumSize, 'TestAccount');

  return {
    account: connectTestAccount(account.address, device),
    ...rest,
  };
};

export const deployMulticall = async (): Promise<{
  multicall: Multicall;
  deployTx: ContractTransaction;
}> => {
  const artifact = await deployer.loadArtifact('Multicall');
  const contract = await deployer.deploy(artifact, []);
  await contract.deployed();

  return {
    multicall: connectMulticall(contract.address, device),
    deployTx: contract.deployTransaction,
  };
};
