import { BytesLike } from 'ethers';
import { Address, address } from './addr';
import {
  Safe,
  Factory,
  Factory__factory,
  Safe__factory,
  ERC1967Proxy,
  ERC1967Proxy__factory,
} from './contracts';
import { Groupish, toSafeGroup } from './group';
import { defaultAbiCoder, hexlify, randomBytes } from 'ethers/lib/utils';
import * as zk from 'zksync-web3';

export interface Proxy extends ERC1967Proxy {}
export class ProxyFactory extends ERC1967Proxy__factory {}

export const randomBytes32 = () => hexlify(randomBytes(32));
export const randomDeploySalt = randomBytes32;

export const connectFactory = Factory__factory.connect;
export const connectSafe = Safe__factory.connect;
export const connectProxy = ProxyFactory.connect;

export interface ProxyConstructorArgs {
  group: Groupish;
  impl: Address;
}

export const encodeProxyConstructorArgs = ({
  group,
  impl,
}: ProxyConstructorArgs) => {
  const g = toSafeGroup(group);

  const safeInterface = Safe__factory.createInterface();
  const encodedInitializeCall = safeInterface.encodeFunctionData('initialize', [
    g.ref,
    g.approvers,
  ]);

  return defaultAbiCoder.encode(
    // constructor(address _logic, bytes memory _data)
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

export const deploySafeProxy = async (
  args: ProxyConstructorArgs,
  factory: Factory,
  salt = randomDeploySalt(),
) => {
  const addr = await calculateProxyAddress(args, factory, salt);

  const encodedConstructorData = encodeProxyConstructorArgs(args);
  const deployTx = await factory.deploy(salt, encodedConstructorData);
  await deployTx.wait();

  return {
    proxy: connectProxy(addr, factory.signer),
    safe: connectSafe(addr, factory.signer),
    salt,
    deployTx,
  };
};

export const isDeployed = async (safe: Safe) =>
  (await safe.provider.getCode(safe.address)) !== '0x';
