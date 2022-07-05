import { BytesLike, Signer } from 'ethers';
import { address, Addresslike } from './addr';

import { calculateSafeAddress, getRandomSalt } from './counterfactual';
import { Safe, Factory, Factory__factory, Safe__factory } from './contracts';
import { Groupish, toSafeGroup } from './group';
import { SafeApprover } from './approver';
import { defaultAbiCoder } from 'ethers/lib/utils';

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

export const getSafe = (addr: Addresslike) =>
  new Safe__factory().attach(address(addr));

interface DeploySafeParams {
  args: SafeConstructorArgs;
  factory: Factory;
  signer: Signer;
  salt?: BytesLike;
}

export const deploySafe = async ({
  args,
  factory,
  salt = getRandomSalt(),
}: DeploySafeParams) => {
  const addr = await calculateSafeAddress(args, factory, salt);

  const constructorDeployData = toSafeConstructorDeployArgsBytes(args);
  const deployTx = await factory.deploySafe(salt, constructorDeployData);

  return {
    safe: getSafe(addr),
    salt,
    deployTx,
    deployReceipt: await deployTx.wait(),
  };
};

export const isDeployed = async (safe: Safe) =>
  (await safe.provider.getCode(safe.address)) !== '0x';
