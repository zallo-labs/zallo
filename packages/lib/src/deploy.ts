import { Address, asAddress, asUAddress } from './address';
import { utils as zkUtils } from 'zksync-ethers';
import { Policy, encodePolicyStruct } from './policy';
import { Network, NetworkWallet } from 'chains';
import { ACCOUNT_ABI, ACCOUNT_PROXY, DEPLOYER } from './contract';
import {
  Hex,
  encodeAbiParameters,
  encodeFunctionData,
  ContractFunctionParameters,
  toHex,
} from 'viem';
import { err, ok } from 'neverthrow';
import { randomHex } from './bytes';

export const randomDeploySalt = () => randomHex(32);

export interface AccountConstructorArgs {
  policies: Policy[];
}

export interface ProxyConstructorArgs extends AccountConstructorArgs {
  implementation: Address;
}

const accountProxyConstructorParamsAbi = ACCOUNT_PROXY.abi.find(
  (x): x is Extract<(typeof ACCOUNT_PROXY.abi)[number], { type: 'constructor' }> =>
    'type' in x && x.type === 'constructor',
)!.inputs;

export const encodeProxyConstructorArgs = ({ policies, implementation }: ProxyConstructorArgs) => {
  const encodedInitializeCall = encodeFunctionData({
    abi: ACCOUNT_ABI,
    functionName: 'initialize',
    args: [policies.map(encodePolicyStruct)],
  });

  return encodeAbiParameters(accountProxyConstructorParamsAbi, [
    implementation,
    encodedInitializeCall,
  ]);
};

export interface GetProxyAddressArgs extends ProxyConstructorArgs {
  network: Network;
  deployer: Address;
  salt: Hex;
}

export async function getProxyAddress({
  network,
  deployer,
  salt,
  ...constructorArgs
}: GetProxyAddressArgs) {
  const address = zkUtils.create2Address(
    deployer,
    toHex(zkUtils.hashBytecode(ACCOUNT_PROXY.bytecode)),
    salt,
    encodeProxyConstructorArgs(constructorArgs),
  );

  return asUAddress(address, network.chain.key);
}

export interface DeployAccountProxyRequestParams extends ProxyConstructorArgs {
  deployer: Address;
  salt: Hex;
}

export function deployAccountProxyRequest({
  deployer,
  salt,
  ...constructorArgs
}: DeployAccountProxyRequestParams) {
  return {
    abi: DEPLOYER.abi,
    address: deployer,
    functionName: 'create2Account' as const,
    args: [
      salt,
      toHex(zkUtils.hashBytecode(ACCOUNT_PROXY.bytecode)),
      encodeProxyConstructorArgs(constructorArgs),
      1, // AccountAbstractionVersion.Version1
    ] as const,
    gas: 3_000_000n * BigInt(constructorArgs.policies.length), // ~1M per policy; gas estimation panics if not provided
  } satisfies ContractFunctionParameters & { gas: bigint };
}

export interface SimulateDeployAccountProxyArgs extends DeployAccountProxyRequestParams {
  network: Network;
}

export async function simulateDeployAccountProxy({
  network,
  deployer,
  salt,
  ...constructorArgs
}: SimulateDeployAccountProxyArgs) {
  const proxy = await getProxyAddress({ network, deployer, salt, ...constructorArgs });

  const params = deployAccountProxyRequest({ deployer, salt, ...constructorArgs });
  const sim = await network.simulateContract(params);
  const expected = asAddress(proxy);
  if (sim.result !== expected) return err({ expected, simulated: sim.result });

  return ok({ proxy, params, ...sim });
}

export interface DeployAccountProxyArgs extends SimulateDeployAccountProxyArgs {
  wallet: NetworkWallet;
}

export const deployAccountProxy = async ({ wallet, ...args }: DeployAccountProxyArgs) => {
  const sim = await simulateDeployAccountProxy(args);

  return sim.asyncMap(async ({ proxy, request }) => {
    const transactionHash = await wallet.writeContract(request);
    return { proxy, transactionHash };
  });
};
