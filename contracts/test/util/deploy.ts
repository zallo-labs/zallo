import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  connectFactory,
  address,
  Multicall,
  deployAccountProxy,
  User,
  connectTestAccount,
  connectMulticall,
  UserConfig,
} from 'lib';
import { allSigners, device } from './wallet';
import { ContractTransaction } from 'ethers';
import * as zk from 'zksync-web3';
import { parseEther } from 'ethers/lib/utils';

type AccountArtifact = 'Account' | 'TestAccount';
type Artifact = AccountArtifact | 'ERC1967Proxy';

const ACCOUNT_START_BALANCE = parseEther('0.001');

export const deployer = new Deployer(hre, device);

export const deployFactory = async (contractName: Artifact) => {
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
  contractName?: AccountArtifact;
} = {}) => {
  const artifact = await deployer.loadArtifact(contractName);
  const contract = await deployer.deploy(artifact);
  await contract.deployed();

  return {
    impl: address(contract.address),
    deployTx: contract.deployTransaction,
  };
};

export const deploy = async (nSigners = 3, contractName: AccountArtifact = 'Account') => {
  const signers = allSigners.slice(0, nSigners).map((approver) => approver.address);
  const [userAddr, ...approvers] = signers;

  const others = allSigners.slice(nSigners).map((approver) => approver.address);

  const config: UserConfig = {
    approvers,
    spendingAllowlisted: false,
    limits: {},
  };

  const user: User = {
    addr: userAddr,
    configs: [config],
  };

  const { factory } = await deployFactory('ERC1967Proxy');
  const { impl } = await deployAccountImpl({ contractName });

  const deployData = await deployAccountProxy({ user, impl }, factory);

  const txResp = await device.sendTransaction({
    to: deployData.account.address,
    value: ACCOUNT_START_BALANCE,
  });
  await txResp.wait();

  return {
    ...deployData,
    impl,
    factory,
    user,
    config,
    signers,
    approvers,
    others,
  };
};

export const deployTestAccount = async (nSigners?: number) => {
  const { account, ...rest } = await deploy(nSigners, 'TestAccount');

  return {
    ...rest,
    account: connectTestAccount(account.address, device),
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
