import { BytesLike, Signer } from 'ethers';

import { getCounterfactualAddress } from './counterfactual';
import { Group } from './group';
import { Safe, Factory, Factory__factory, Safe__factory } from './typechain';

export const getSafeFactory = (addr: string, signer: Signer) =>
  new Factory__factory().attach(addr).connect(signer);

export const deploySafeFactory = async (signer: Signer) => {
  const factory = await new Factory__factory().connect(signer).deploy();
  await factory.deployed();
  return factory;
};

export const getSafe = (addr: string, signer: Signer) =>
  new Safe__factory().attach(addr).connect(signer);

interface DeploySafeParams {
  deployer: Signer;
  group: Group;
  factory: Factory;
  salt?: BytesLike;
}

export const deploySafe = async ({
  deployer,
  group,
  factory,
  salt: _salt,
}: DeploySafeParams) => {
  const { addr, salt } = getCounterfactualAddress(factory, group, _salt);

  const bytecode = new Safe__factory().getDeployTransaction(group).data!;

  const deployTx = await factory.create(bytecode, salt, {
    gasLimit: 2500000,
  });
  const deployReceipt = await deployTx.wait();

  const safe = getSafe(addr, deployer);

  return {
    safe,
    salt,
    deployTx,
    deployReceipt,
  };
};

export const isDeployed = async (safe: Safe) =>
  (await safe.provider.getCode(safe.address)) !== '0x';
