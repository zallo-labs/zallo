import { err, ok } from 'neverthrow';
import { encodeAbiParameters, encodeFunctionData, Hex } from 'viem';
import { utils as zkUtils } from 'zksync-ethers';

import { Network, NetworkWallet } from 'chains';
import { Address, asAddress, asUAddress } from './address';
import { randomHex } from './bytes';
import { ACCOUNT_IMPLEMENTATION, ACCOUNT_PROXY, ACCOUNT_PROXY_FACTORY } from './contract';
import { encodePolicyStruct, Policy } from './policy';

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

export interface DeployAccountProxyArgs extends ProxyConstructorArgs {
  network: Network;
  wallet: NetworkWallet;
  factory: Address;
  salt: Hex;
}

export const deployAccountProxy = async ({
  network,
  wallet,
  factory,
  salt,
  ...constructorArgs
}: DeployAccountProxyArgs) => {
  const proxy = await getProxyAddress({ network, factory, salt, ...constructorArgs });

  const sim = await network.simulateContract({
    abi: ACCOUNT_PROXY_FACTORY.abi,
    address: factory,
    functionName: 'deploy',
    args: [encodeProxyConstructorArgs(constructorArgs), salt],
  });
  const expected = asAddress(proxy);
  if (sim.result !== expected) return err({ expected, simulated: sim.result });

  const transactionHash = await wallet.writeContract(sim.request);

  return ok({ proxy, transactionHash });
};
