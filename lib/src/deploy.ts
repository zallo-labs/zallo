import { BytesLike } from 'ethers';
import { Address, asAddress } from './address';
import { Factory } from './contracts/Factory';
import { defaultAbiCoder, hexlify, isHexString, randomBytes } from 'ethers/lib/utils';
import * as zk from 'zksync-web3';
import { ACCOUNT_INTERFACE } from './decode';
import { POLICY_ABI, Policy } from './policy';
import { AccountProxy__factory, Account__factory } from './contracts';
import { asHex } from './bytes';

export type DeploySalt = string & { isDeploySalt: true };
const DEPLOY_SALT_BYTES = 32;

export const isDeploySalt = (v: unknown): v is DeploySalt => isHexString(v, DEPLOY_SALT_BYTES);

export const toDeploySalt = (v: string): DeploySalt => {
  if (!isDeploySalt(v)) throw new Error(`Invalid deploy salt: ${v}`);
  return v;
};

export const randomDeploySalt = () => hexlify(randomBytes(DEPLOY_SALT_BYTES)) as DeploySalt;

export interface AccountConstructorArgs {
  policies: Policy[];
}

export interface ProxyConstructorArgs extends AccountConstructorArgs {
  impl: Address;
}

export const encodeProxyConstructorArgs = ({ policies, impl }: ProxyConstructorArgs) => {
  const encodedInitializeCall = ACCOUNT_INTERFACE.encodeFunctionData('initialize', [
    policies.map(POLICY_ABI.asStruct),
  ]);

  return asHex(
    defaultAbiCoder.encode(
      // new ERC1967Proxy(address logic, bytes data)
      ['address', 'bytes'],
      [impl, encodedInitializeCall],
    ),
  );
};

export interface DeployArgs extends ProxyConstructorArgs {
  factory: Factory;
  salt: BytesLike;
}

export const getProxyAddress = async ({ factory, salt, ...constructorArgs }: DeployArgs) =>
  asAddress(
    zk.utils.create2Address(
      factory.address,
      await factory._BYTECODE_HASH(),
      salt,
      encodeProxyConstructorArgs(constructorArgs),
    ),
  );

export const deployAccountProxy = async ({ factory, salt, ...constructorArgs }: DeployArgs) => {
  const proxy = await getProxyAddress({ factory, salt, ...constructorArgs });

  const deployTx = await factory.deploy(encodeProxyConstructorArgs(constructorArgs), salt);
  await deployTx.wait();

  return {
    proxy: AccountProxy__factory.connect(proxy, factory.signer),
    account: Account__factory.connect(proxy, factory.signer),
    salt,
    deployTx,
  };
};
