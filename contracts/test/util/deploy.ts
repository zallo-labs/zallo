import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import {
  asAddress,
  asPolicy,
  asTx,
  deployAccountProxy,
  executeTransaction,
  randomDeploySalt,
  TxOptions,
} from 'lib';
import { network, wallet, wallets } from './network';
import { BytesLike, Overrides } from 'ethers';
import * as zk from 'zksync-web3';
import { getApprovals } from './approval';
import { Address, parseEther } from 'viem';
import { CONFIG } from '../../config';

const deployer = new Deployer(hre, new zk.Wallet(CONFIG.walletPrivateKey));

type AccountContractName = 'Account' | 'TestAccount';
type ContractName =
  | AccountContractName
  | 'Factory'
  | 'ERC1967Proxy'
  | 'TestUtil'
  | 'TestVerifier'
  | 'TestPolicyManager';

interface DeployOptions<ConstructorArgs extends unknown[] = unknown[]> {
  constructorArgs?: ConstructorArgs;
  overrides?: Overrides;
  additionalFactoryDeps?: BytesLike[];
}

export async function deploy(
  contractName: ContractName,
  { constructorArgs, overrides, additionalFactoryDeps }: DeployOptions = {},
) {
  const artifact = await deployer.loadArtifact(contractName);

  const contract = await deployer.deploy(
    artifact,
    constructorArgs,
    overrides,
    additionalFactoryDeps,
  );
  await contract.deployed();

  return {
    address: asAddress(contract.address),
    deployTx: contract.deployTransaction,
    constructorArgs,
  };
}

export type DeployResult = Awaited<ReturnType<typeof deploy>>;

export const deployFactory = async (contractName: string) => {
  const contractArtifact = await deployer.loadArtifact(contractName);
  const contractBytecodeHash = zk.utils.hashBytecode(contractArtifact.bytecode);

  return deploy('Factory', {
    constructorArgs: [contractBytecodeHash],
    additionalFactoryDeps: [contractArtifact.bytecode],
  });
};

export interface DeployProxyOptions {
  nApprovers?: number;
  accountContract?: AccountContractName;
  extraBalance?: bigint;
  implementation?: Address;
}

export const deployProxy = async ({
  nApprovers = 2,
  accountContract = 'Account',
  extraBalance = 0n,
}: DeployProxyOptions = {}) => {
  const approvers = new Set(wallets.slice(0, nApprovers).map((signer) => signer.address));
  const policy = asPolicy({ key: 1, approvers, threshold: approvers.size });

  const { address: factory } = await deployFactory('ERC1967Proxy');
  const { address: implementation } = await deploy(accountContract);

  const { proxy: account, transactionHash: deployTransactionHash } = (
    await deployAccountProxy({
      network,
      wallet,
      factory,
      implementation,
      policies: [policy],
      salt: randomDeploySalt(),
    })
  )._unsafeUnwrap();
  await network.waitForTransactionReceipt({ hash: deployTransactionHash });

  await network.waitForTransactionReceipt({
    hash: await wallet.sendTransaction({
      to: asAddress(account),
      value: parseEther('0.02') + extraBalance,
    }),
  });

  return {
    account,
    policy,
    execute: async (txOpts: TxOptions) => {
      const tx = asTx(txOpts);

      const r = await executeTransaction({
        network,
        account: asAddress(account),
        tx,
        policy,
        approvals: await getApprovals(account, approvers, tx),
      });

      if (r.isErr())
        throw new Error(`Execute failed with error ${r.error.message}`, { cause: r.error });

      return r.value;
    },
  };
};

export type DeployProxyData = Awaited<ReturnType<typeof deployProxy>>;
