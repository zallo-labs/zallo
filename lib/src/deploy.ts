import { BytesLike, ethers, Signer } from 'ethers';
import { Address, address, Addresslike } from './addr';
import {
  Factory,
  Factory__factory,
  Account__factory,
  ERC1967Proxy__factory,
  TestAccount__factory,
  Multicall__factory,
} from './contracts';
import { defaultAbiCoder, hexlify, isHexString, randomBytes } from 'ethers/lib/utils';
import * as zk from 'zksync-web3';
import { UserWallet } from './user';
import { ACCOUNT_INTERFACE } from './decode';
import { Quorum, toQuorumDefStruct } from './quorum';

export type DeploySalt = string & { isDeploySalt: true };
const DEPLOY_SALT_BYTES = 32;

export const isDeploySalt = (v: unknown): v is DeploySalt => isHexString(v, DEPLOY_SALT_BYTES);

export const toDeploySalt = (v: string): DeploySalt => {
  if (!isDeploySalt(v)) throw new Error(`Invalid deploy salt: ${v}`);
  return v;
};

export const randomDeploySalt = () => hexlify(randomBytes(DEPLOY_SALT_BYTES)) as DeploySalt;

const createConnect =
  <T>(f: (addr: string, signer: Signer | ethers.providers.Provider | UserWallet) => T) =>
  (addr: Addresslike, signer: Signer | ethers.providers.Provider | UserWallet): T =>
    f(address(addr), signer);

export const connectFactory = createConnect(Factory__factory.connect);
export const connectAccount = createConnect(Account__factory.connect);
export const connectTestAccount = createConnect(TestAccount__factory.connect);
export const connectProxy = createConnect(ERC1967Proxy__factory.connect);
export const connectMulticall = createConnect(Multicall__factory.connect);

export interface AccountConstructorArgs {
  quorums: Quorum[];
}

export interface ProxyConstructorArgs extends AccountConstructorArgs {
  impl: Address;
}

export const encodeProxyConstructorArgs = ({ quorums, impl }: ProxyConstructorArgs) => {
  const encodedInitializeCall = ACCOUNT_INTERFACE.encodeFunctionData('initialize', [
    quorums.map(toQuorumDefStruct),
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
    proxy: connectProxy(addr, factory.signer),
    account: connectAccount(addr, factory.signer),
    salt,
    deployTx,
  };
};
