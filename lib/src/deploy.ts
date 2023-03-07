import { BytesLike } from 'ethers';
import { Address, address } from './addr';
import { Factory } from './contracts/Factory';
import { defaultAbiCoder, hexlify, isHexString, randomBytes } from 'ethers/lib/utils';
import * as zk from 'zksync-web3';
import { ACCOUNT_INTERFACE } from './decode';
import { Policy } from './policy';
import { AccountProxy__factory, Account__factory } from './contracts';

export type DeploySalt = string & { isDeploySalt: true };
const DEPLOY_SALT_BYTES = 32;

export const isDeploySalt = (v: unknown): v is DeploySalt => isHexString(v, DEPLOY_SALT_BYTES);

export const toDeploySalt = (v: string): DeploySalt => {
  if (!isDeploySalt(v)) throw new Error(`Invalid deploy salt: ${v}`);
  return v;
};

export const randomDeploySalt = () => hexlify(randomBytes(DEPLOY_SALT_BYTES)) as DeploySalt;

export interface AccountConstructorArgs {
  rules: Policy[];
}

export interface ProxyConstructorArgs extends AccountConstructorArgs {
  impl: Address;
}

export const encodeProxyConstructorArgs = ({ rules, impl }: ProxyConstructorArgs) => {
  const encodedInitializeCall = ACCOUNT_INTERFACE.encodeFunctionData('initialize', [
    rules.map((r) => r.struct),
  ]);

  return defaultAbiCoder.encode(
    // new ERC1967Proxy(address _logic, bytes memory _data)
    ['address', 'bytes'],
    [impl, encodedInitializeCall],
  );
};

export const calculateProxyAddress = async (
  args: ProxyConstructorArgs,
  factory: Factory,
  salt: BytesLike,
) => {
  const addr = zk.utils.create2Address(
    factory.address,
    await factory._BYTECODE_HASH(),
    salt,
    encodeProxyConstructorArgs(args),
  );

  return address(addr);
};

export const deployAccountProxy = async (
  args: ProxyConstructorArgs,
  factory: Factory,
  salt = randomDeploySalt(),
) => {
  const addr = await calculateProxyAddress(args, factory, salt);

  const encodedConstructorData = encodeProxyConstructorArgs(args);
  const deployTx = await factory.deploy(encodedConstructorData, salt);
  await deployTx.wait();

  return {
    proxy: AccountProxy__factory.connect(addr, factory.signer),
    account: Account__factory.connect(addr, factory.signer),
    salt,
    deployTx,
  };
};
