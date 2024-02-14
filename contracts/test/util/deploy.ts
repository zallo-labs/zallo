import * as hre from 'hardhat';
import {
  asAddress,
  asPolicy,
  asTx,
  deployAccountProxy,
  encodeTransactionSignature,
  executeTransactionUnsafe,
  Policy,
  randomDeploySalt,
  replaceSelfAddress,
  TxOptions,
} from 'lib';
import { network, testNetwork, wallet, wallets } from './network';
import { BytesLike, hexlify, Interface, Overrides } from 'ethers';
import * as zk from 'zksync-ethers';
import { getApprovals } from './approval';
import { Abi, Address, bytesToHex, parseEther, zeroHash } from 'viem';
import { CONFIG } from '../../config';
import { AbiParametersToPrimitiveTypes } from 'abitype';
import Factory from '../contracts/Factory';
import Account from '../contracts/Account';
import AccountProxy from '../contracts/AccountProxy';

const zkProvider = new zk.Provider(CONFIG.chain.rpcUrls.default.http[0]);

interface DeployOptions {
  overrides?: Overrides;
  factoryDeps?: BytesLike[];
}

type ConstructorArgs<TAbi extends Abi> = AbiParametersToPrimitiveTypes<
  Extract<TAbi[number], { type: 'constructor' }>['inputs']
>;

type ContractArtifact<TAbi extends Abi> = { contractName: string; abi: TAbi };

export async function deploy<TAbi extends Abi>(
  ...params: ConstructorArgs<TAbi> extends never
    ? [ContractArtifact<TAbi>, undefined?, DeployOptions?]
    : [ContractArtifact<TAbi>, ConstructorArgs<TAbi>, DeployOptions?]
) {
  const [artifactDetails, constructorArgs, { overrides, factoryDeps }] = [
    params[0],
    params[1] ?? [],
    params[2] ?? {},
  ];

  const sender = new zk.Wallet(CONFIG.walletPrivateKey, zkProvider);
  const artifact = await hre.artifacts.readArtifact(artifactDetails.contractName);

  const factory = new zk.ContractFactory(artifact.abi, artifact.bytecode, sender, 'create2');

  const salt = zeroHash;

  const encodedConstructorArgs = new Interface(artifact.abi).encodeDeploy(
    (constructorArgs as unknown[]) ?? [],
  );

  // const constructorAbiParams =
  //   (artifact.abi as Abi).find((x): x is AbiConstructor => 'type' in x && x.type === 'constructor')
  //     ?.inputs ?? [];
  // const encodedConstructorArgs = encodeAbiParameters(constructorAbiParams, constructorArgs ?? []);

  const potentialAddress = asAddress(
    zk.utils.create2Address(
      sender.address,
      hexlify(zk.utils.hashBytecode(artifact.bytecode)),
      salt,
      encodedConstructorArgs,
    ),
  );

  const isDeployed = !!(await network.getBytecode({ address: potentialAddress }))?.length;
  if (isDeployed) return { address: potentialAddress, deployTx: null, constructorArgs };

  const contract = await factory.deploy(...((constructorArgs as unknown[]) ?? []), {
    customData: { ...overrides, salt, factoryDeps },
  });
  await contract.waitForDeployment();

  return {
    address: asAddress(await contract.getAddress()),
    deployTx: contract.deploymentTransaction(),
    constructorArgs,
  };
}

export type DeployResult = Awaited<ReturnType<typeof deploy>>;

export const deployFactory = async (childDetails: ContractArtifact<Abi>) => {
  const childContractArtifact = await hre.artifacts.readArtifact(childDetails.contractName);
  const childContractBytecodeHash = zk.utils.hashBytecode(childContractArtifact.bytecode);

  return deploy(Factory, [bytesToHex(childContractBytecodeHash)], {
    factoryDeps: [childContractArtifact.bytecode],
  });
};

export interface DeployProxyOptions {
  nApprovers?: number;
  extraBalance?: bigint;
  implementation?: Address;
  policies?: Policy[];
}

export const deployProxy = async ({
  nApprovers = 2,
  extraBalance = 0n,
  policies: inputPolicies,
}: DeployProxyOptions = {}) => {
  const approvers = new Set(wallets.slice(0, nApprovers).map((signer) => signer.address));

  const { address: factory } = await deployFactory(AccountProxy);
  const { address: implementation } = await deploy(Account, []);

  const initPolicies = inputPolicies ?? [
    asPolicy({ key: 1, approvers, threshold: approvers.size }),
  ];
  const { proxy: account, transactionHash: deployTransactionHash } = (
    await deployAccountProxy({
      network,
      wallet,
      factory,
      implementation,
      policies: initPolicies,
      salt: randomDeploySalt(),
    })
  )._unsafeUnwrap();
  await network.waitForTransactionReceipt({ hash: deployTransactionHash });

  const policies = initPolicies.map((p) => replaceSelfAddress(p, asAddress(account)));
  const policy = policies[0];

  await testNetwork.setBalance({
    address: asAddress(account),
    value: parseEther('1') + extraBalance,
  });

  return {
    account,
    policy,
    policies,
    execute: async (txOpts: TxOptions) => {
      const tx = asTx(txOpts);
      const approvals = await getApprovals(account, approvers, tx);

      const r = await executeTransactionUnsafe({
        network,
        account: asAddress(account),
        tx,
        customSignature: encodeTransactionSignature({ tx, policy, approvals }),
      });

      if (r.isErr())
        throw new Error(`Execute failed with error ${r.error.message}`, { cause: r.error });

      return r.value.transactionHash;
    },
  };
};

export type DeployProxyData = Awaited<ReturnType<typeof deployProxy>>;
