import { BytesLike, ethers, Signer } from 'ethers';
import { Address, address, Addresslike } from './addr';
import {
  Safe,
  Factory,
  Factory__factory,
  Safe__factory,
  ERC1967Proxy__factory,
} from './contracts';
import { Account } from './account';
import {
  defaultAbiCoder,
  hexDataLength,
  hexlify,
  randomBytes,
} from 'ethers/lib/utils';
import * as zk from 'zksync-web3';

export type DeploySalt = string & { isDeploySalt: true };
const DEPLOY_SALT_BYTES = 32;

export const toDeploySalt = (v: string): DeploySalt => {
  if (hexDataLength(v) !== DEPLOY_SALT_BYTES)
    throw new Error('Invalid deploy salt: ' + v);

  return v as DeploySalt;
};

export const randomDeploySalt = () =>
  hexlify(randomBytes(DEPLOY_SALT_BYTES)) as DeploySalt;

const createConnect =
  <T>(f: (addr: string, signer: Signer | ethers.providers.Provider) => T) =>
  (addr: Addresslike, signer: Signer | ethers.providers.Provider): T =>
    f(address(addr), signer);

export const connectFactory = createConnect(Factory__factory.connect);
export const connectSafe = createConnect(Safe__factory.connect);
export const connectProxy = createConnect(ERC1967Proxy__factory.connect);

export interface SafeConstructorArgs {
  account: Account;
}

export interface ProxyConstructorArgs extends SafeConstructorArgs {
  impl: Address;
}

export const encodeProxyConstructorArgs = ({
  account,
  impl,
}: ProxyConstructorArgs) => {
  const safeInterface = Safe__factory.createInterface();
  const encodedInitializeCall = safeInterface.encodeFunctionData('initialize', [
    account.ref,
    account.quorums,
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
