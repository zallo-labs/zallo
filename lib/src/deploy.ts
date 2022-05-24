import { BytesLike, Signer } from 'ethers';
import { address, Addresslike } from './addr';

import { calculateSafeAddress } from './counterfactual';
import { Safe, Factory, Factory__factory, Safe__factory } from './typechain';

type WithoutLastElem<P extends unknown[]> = P extends [...infer Head, unknown]
  ? Head
  : [];

export type SafeConstructorArgs = WithoutLastElem<
  Required<Parameters<Safe__factory['getDeployTransaction']>>
>;

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
  const { addr, salt } = await calculateSafeAddress(args, factory, _salt);

  // zkSync FIXME: create2 support
  // const bytecode = new Safe__factory().getDeployTransaction(...args).data!;
  // const deployTx = await factory.create(bytecode, salt, {
  //   gasLimit: 10_000_000,
  // });

  const deployTx = await factory.create(...args, {
    gasLimit: 1_000_000,
  });
  const deployReceipt = await deployTx.wait();

  const safe = getSafe(addr, signer);

  return {
    safe,
    salt,
    deployTx,
    deployReceipt,
  };
};

export const isDeployed = async (safe: Safe) =>
  (await safe.provider.getCode(safe.address)) !== '0x';
