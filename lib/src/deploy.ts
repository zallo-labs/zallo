import { Signer } from 'ethers';

import { getCounterfactualAddress } from './counterfactual';
import { Group } from './group';
import { SafeFactory__factory, Safe__factory } from './typechain';

export const getFactory = (addr: string) =>
  new SafeFactory__factory().attach(addr);

export const getOrCreateFactory = async (signer: Signer) => {
  const factory = await new SafeFactory__factory().connect(signer).deploy();
  await factory.deployed();
  return factory;
};

export const getSafe = async (signer: Signer, addr: string) => {
  const safe = new Safe__factory().connect(signer).attach(addr);
  await safe.deployed();
  return safe;
};

export const deploySafe = async (signer: Signer, group: Group) => {
  const factory = await getOrCreateFactory(signer);

  const { addr, salt } = getCounterfactualAddress(factory, group);

  const deployTx = await factory.create(salt, group);
  const deployReceipt = await deployTx.wait();

  const safe = await getSafe(signer, addr);

  return {
    safe,
    salt,
    deployTx,
    deployReceipt,
  };
};
