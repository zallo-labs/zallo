import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  connectFactory,
  address,
  Multicall,
  deployAccountProxy,
  connectTestAccount,
  connectMulticall,
  Quorum,
  randomQuorumKey,
  connectAccount,
  TxOptions,
} from 'lib';
import { SIGNERS, WALLET } from './wallet';
import { BigNumberish, ContractTransaction } from 'ethers';
import * as zk from 'zksync-web3';
import { parseEther } from 'ethers/lib/utils';
import { Tester__factory } from 'lib/src/contracts';
import { execute } from './execute';

type AccountArtifact = 'Account' | 'TestAccount';
type Artifact = AccountArtifact | 'ERC1967Proxy';

export const ACCOUNT_START_BALANCE = parseEther('0.02');

export const deployer = new Deployer(hre, WALLET);

export const deployFactory = async (contractName: Artifact) => {
  const contractArtifact = await deployer.loadArtifact(contractName);
  const contractBytecodeHash = zk.utils.hashBytecode(contractArtifact.bytecode);

  const artifact = await deployer.loadArtifact('Factory');
  const contract = await deployer.deploy(artifact, [contractBytecodeHash], undefined, [
    contractArtifact.bytecode,
  ]);
  await contract.deployed();

  return {
    factory: connectFactory(contract.address, WALLET),
    deployTx: contract.deployTransaction,
  };
};

export const deployTester = async () => {
  const artifact = await deployer.loadArtifact('Tester');
  const contract = await deployer.deploy(artifact);
  await contract.deployed();

  return Tester__factory.connect(contract.address, WALLET);
};

export const deployAccountImpl = async ({
  contractName = 'Account',
}: {
  contractName?: AccountArtifact;
} = {}) => {
  const artifact = await deployer.loadArtifact(contractName);
  const contract = await deployer.deploy(artifact);
  await contract.deployed();

  const impl = address(contract.address);

  return {
    impl,
    account: connectAccount(impl, WALLET),
    deployTx: contract.deployTransaction,
  };
};

export type AccountImplData = Awaited<ReturnType<typeof deployAccountImpl>>;

export interface DeployOptions {
  signers?: number;
  contractName?: AccountArtifact;
  extraBalance?: BigNumberish;
}

export const deployProxy = async ({
  signers = 2,
  contractName = 'Account',
  extraBalance,
}: DeployOptions = {}) => {
  const quorum: Quorum = {
    key: randomQuorumKey(),
    approvers: new Set(SIGNERS.slice(0, signers).map((approver) => address(approver.address))),
  };

  const { factory } = await deployFactory('ERC1967Proxy');
  const { impl } = await deployAccountImpl({ contractName });
  const { account } = await deployAccountProxy({ impl, quorums: [quorum] }, factory);

  const txResp = await WALLET.sendTransaction({
    to: account.address,
    value: ACCOUNT_START_BALANCE.add(extraBalance || 0),
  });
  await txResp.wait();

  return { account, quorum, execute: (txOpts: TxOptions) => execute(account, quorum, txOpts) };
};

export type DeployProxyData = Awaited<ReturnType<typeof deployProxy>>;

export const deployTesterProxy = async (options: Omit<DeployOptions, 'contractName'> = {}) => {
  const { account, ...rest } = await deployProxy({ ...options, contractName: 'TestAccount' });

  return { ...rest, account: connectTestAccount(account.address, WALLET) };
};

export type DeployTesterProxyData = Awaited<ReturnType<typeof deployTesterProxy>>;

export const deployMulticall = async (): Promise<{
  multicall: Multicall;
  deployTx: ContractTransaction;
}> => {
  const artifact = await deployer.loadArtifact('Multicall');
  const contract = await deployer.deploy(artifact, []);
  await contract.deployed();

  return {
    multicall: connectMulticall(contract.address, WALLET),
    deployTx: contract.deployTransaction,
  };
};
