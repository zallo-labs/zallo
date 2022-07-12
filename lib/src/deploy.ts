import { BytesLike, Signer } from 'ethers';
import { address, Addresslike } from './addr';
import { Safe, Factory, Factory__factory, Safe__factory } from './contracts';
import { Groupish, toSafeGroup } from './group';
import { SafeApprover } from './approver';
import { defaultAbiCoder, hexlify, randomBytes } from 'ethers/lib/utils';
import * as zk from 'zksync-web3';

export interface SafeConstructorArgs {
  group: Groupish;
}

export type SafeConstructorDeployArgs = [BytesLike, SafeApprover[]];

export const toSafeConstructorDeployArgs = (
  args: SafeConstructorArgs,
): SafeConstructorDeployArgs => {
  const g = toSafeGroup(args.group);
  return [g.ref, g.approvers];
};

export type SafeConstructorDeployArgsBytes = BytesLike & {
  isSafeConstructorDeployArgsBytes: true;
};

export const toSafeConstructorDeployArgsBytes = (
  args: SafeConstructorArgs,
): SafeConstructorDeployArgsBytes =>
  defaultAbiCoder.encode(
    ['bytes32', '(address addr,uint96 weight)[]'],
    toSafeConstructorDeployArgs(args),
  ) as SafeConstructorDeployArgsBytes;

export const getFactory = (addr: Addresslike, signer: Signer) =>
  new Factory__factory().attach(address(addr)).connect(signer);

export const getSafe = (addr: Addresslike, signer: Signer) =>
  new Safe__factory().attach(address(addr)).connect(signer);

export const getRandomDeploySalt = () => hexlify(randomBytes(32));

export const calculateSafeAddress = async (
  args: SafeConstructorArgs,
  factory: Factory,
  salt: BytesLike,
) => {
  const addr = zk.utils.create2Address(
    factory.address,
    await factory._safeBytecodeHash(),
    salt,
    toSafeConstructorDeployArgsBytes(args),
  );

  return address(addr);
};

interface DeploySafeParams {
  args: SafeConstructorArgs;
  factory: Factory;
  salt?: BytesLike;
}

export const deploySafe = async ({
  args,
  factory,
  salt = getRandomDeploySalt(),
}: DeploySafeParams) => {
  const addr = await calculateSafeAddress(args, factory, salt);

  const constructorDeployData = toSafeConstructorDeployArgsBytes(args);
  const deployTx = await factory.deploySafe(salt, constructorDeployData);

  return {
    safe: getSafe(addr, factory.signer),
    salt,
    deployTx,
    deployReceipt: await deployTx.wait(),
  };
};

export const isDeployed = async (safe: Safe) =>
  (await safe.provider.getCode(safe.address)) !== '0x';
