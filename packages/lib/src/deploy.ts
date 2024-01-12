import { Address, UAddress, asAddress, asUAddress } from './address';
import { utils as zkUtils } from 'zksync-ethers';
import { Policy, encodePolicyStruct } from './policy';
import { Network, NetworkWallet } from 'chains';
import { ACCOUNT_IMPLEMENTATION, ACCOUNT_PROXY, ACCOUNT_PROXY_FACTORY } from './contract';
import {
  Hex,
  TypedDataDefinition,
  encodeAbiParameters,
  encodeFunctionData,
  getAbiItem,
  ContractFunctionParameters,
} from 'viem';
import { err, ok } from 'neverthrow';
import { randomHex } from './bytes';
import { getContractTypedDataDomain } from './util/typed-data';
import { AbiParameterToPrimitiveType, TypedData } from 'abitype';

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
    abi: ACCOUNT_IMPLEMENTATION.abi,
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
  factory: Address;
  salt: Hex;
}

export async function getProxyAddress({
  network,
  factory,
  salt,
  ...constructorArgs
}: GetProxyAddressArgs) {
  const address = zkUtils.create2Address(
    factory,
    await network.readContract({
      abi: ACCOUNT_PROXY_FACTORY.abi,
      address: factory,
      functionName: '_BYTECODE_HASH',
    }),
    salt,
    encodeProxyConstructorArgs(constructorArgs),
  );

  return asUAddress(address, network.chain.key);
}

export interface DeployAccountProxyRequestParams extends ProxyConstructorArgs {
  factory: Address;
  salt: Hex;
}

export function deployAccountProxyRequest({
  factory,
  salt,
  ...constructorArgs
}: DeployAccountProxyRequestParams) {
  return {
    abi: ACCOUNT_PROXY_FACTORY.abi,
    address: factory,
    functionName: 'deploy' as const,
    args: [encodeProxyConstructorArgs(constructorArgs), salt] as const,
    // ...(refund
    //   ? ({
    //       functionName: 'deployWithRefund',
    //       args: [encodeProxyConstructorArgs(constructorArgs), salt, refund],
    //     } as const)
    //   : ({
    //       functionName: 'deploy',
    //       args: [encodeProxyConstructorArgs(constructorArgs), salt],
    //     } as const)),
  } satisfies ContractFunctionParameters;
}

export interface SimulateDeployAccountProxyArgs extends DeployAccountProxyRequestParams {
  network: Network;
}

export async function simulateDeployAccountProxy({
  network,
  factory,
  salt,
  ...constructorArgs
}: SimulateDeployAccountProxyArgs) {
  const proxy = await getProxyAddress({ network, factory, salt, ...constructorArgs });

  const params = deployAccountProxyRequest({ factory, salt, ...constructorArgs });
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

const deployWithRefundItem = getAbiItem({
  abi: ACCOUNT_PROXY_FACTORY.abi,
  name: 'deployWithRefund',
});
type DeployWithRefund = (typeof deployWithRefundItem)['inputs'][2];
export type RefundDeploymentArgs = AbiParameterToPrimitiveType<DeployWithRefund>;
export type RefundDeploymentMessage = RefundDeploymentArgs['message'];

const DEPLOYMENT_REFUND_TYPES = {
  DeploymentRefund: [
    { name: 'token', type: 'address' },
    { name: 'maxAmount', type: 'uint256' },
  ],
} satisfies TypedData;

export function deploymentRefundTypedData(account: UAddress, message: RefundDeploymentMessage) {
  return {
    domain: getContractTypedDataDomain(account),
    types: DEPLOYMENT_REFUND_TYPES,
    primaryType: 'DeploymentRefund' as const,
    message,
  } satisfies TypedDataDefinition;
}
