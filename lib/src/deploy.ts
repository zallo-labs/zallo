import { BytesLike, Signer } from 'ethers';
import { address, Addresslike } from './addr';

import { calculateSafeAddress } from './counterfactual';
import { Safe, Factory, Factory__factory, Safe__factory } from './contracts';
import { Groupish, toSafeGroup } from './group';
import { SafeApprover } from './approver';

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

export const getFactory = (addr: Addresslike, signer: Signer) =>
  new Factory__factory().attach(address(addr)).connect(signer);

export const getSafe = (addr: Addresslike, signer: Signer) =>
  new Safe__factory().attach(address(addr)).connect(signer);

interface DeploySafeParams {
  args: SafeConstructorArgs;
  factory: Factory;
  signer: Signer;
  salt?: BytesLike;
}

export const deploySafe = async ({
  args,
  factory,
  signer,
  salt: _salt,
}: DeploySafeParams) => {
  const deployArgs = toSafeConstructorDeployArgs(args);
  const { addr, salt } = await calculateSafeAddress(deployArgs, factory, _salt);

  // zkSync FIXME: create2 support
  // const bytecode = new Safe__factory().getDeployTransaction(...args).data!;
  // const deployTx = await factory.create(bytecode, salt, {
  //   gasLimit: 10_000_000,
  // });

  const deployTx = await factory.create(...deployArgs, {
    gasLimit: 1_000_000,
  });

  return {
    safe: getSafe(addr, signer),
    salt,
    deployTx,
    deployReceipt: await deployTx.wait(),
  };
};

export const isDeployed = async (safe: Safe) =>
  (await safe.provider.getCode(safe.address)) !== '0x';
