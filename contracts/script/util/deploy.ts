import { AbiParametersToPrimitiveTypes } from 'abitype';
import { Abi, Address, Hex, encodeAbiParameters, formatEther, toHex, zeroHash } from 'viem';
import * as zk from 'zksync-ethers';
import { account, network, wallet } from './network';
import * as hre from 'hardhat';
import chalk from 'chalk';
import { verify } from './verify';
import { CONFIG } from '../../config';
import { CREATE2_FACTORY } from './create2Factory';
import { hashBytecode } from 'zksync-ethers/build/utils';

type ConstructorArgs<TAbi extends Abi> = AbiParametersToPrimitiveTypes<
  Extract<TAbi[number], { type: 'constructor' }>['inputs']
>;

type ContractArtifact<TAbi extends Abi> = {
  contractName: string;
  abi: TAbi;
  factoryDeps: Record<string, Hex>;
};

export async function deploy<TAbi extends Abi>(
  ...params: ConstructorArgs<TAbi> extends never
    ? [ContractArtifact<TAbi>, undefined?]
    : [ContractArtifact<TAbi>, ConstructorArgs<TAbi>]
) {
  const [artifact, constructorArgs] = [params[0], params[1] ?? []];

  console.log(chalk.magenta(`=============== Deploying ${artifact.contractName} ===============`));

  const hhArtifact = await hre.artifacts.readArtifact(artifact.contractName);
  const constructorAbi = artifact.abi.find((item) => item.type === 'constructor') as Extract<
    (typeof artifact.abi)[number],
    { type: 'constructor' }
  >;

  const salt = zeroHash;
  const bytecodeHash = toHex(zk.utils.hashBytecode(hhArtifact.bytecode));
  const input = constructorAbi
    ? encodeAbiParameters(constructorAbi.inputs, constructorArgs as any)
    : '0x';
  const address = zk.utils.create2Address(
    CREATE2_FACTORY.address,
    bytecodeHash,
    salt,
    input,
  ) as Address;

  console.log(chalk.blue('Address: ') + explorer('address/', address));

  const isDeployed = !!(await network.getCode({ address }))?.length;
  if (!isDeployed) {
    const hash = await wallet.writeContract({
      account,
      abi: CREATE2_FACTORY.abi,
      address: CREATE2_FACTORY.address,
      factoryDeps: [hhArtifact.bytecode as Hex, ...Object.values(artifact.factoryDeps)],
      functionName: 'create2',
      args: [salt, bytecodeHash, input],
    });
    console.log(chalk.blue('Transaction: ') + explorer('tx/', hash));

    const receipt = await network.waitForTransactionReceipt({ hash });
    console.log(
      chalk.blue(`Cost: ${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ETH`),
    );
  }

  console.log(chalk.yellow('========== Verification =========='));
  await verify({
    contract: `${hhArtifact.sourceName}:${hhArtifact.contractName}`,
    address,
    constructorArguments: constructorArgs,
  });
  console.log(chalk.yellow('=================================='));

  return { address, constructorArgs };
}

function explorer(href: `${string}/`, id: string) {
  const blockExplorer = CONFIG.chain.blockExplorers?.native.url;
  if (!blockExplorer) return chalk.bold.cyan(id);

  return chalk.cyan(blockExplorer + href) + chalk.bold.cyan(id);
}
