import { ethers } from 'hardhat';
import {
  toGroup,
  deploySafe,
  getCounterfactualAddress,
  getOrCreateFactory,
  hashGroup,
  SafeEvent,
} from 'lib';

import { expect } from './util';

export const deploy = async (weights: number[]) => {
  if (weights.length === 0) throw Error('No weights provided');

  const priorBlock = await ethers.provider.getBlockNumber();

  const allSigners = await ethers.getSigners();
  const approvers = allSigners.slice(0, weights.length);
  const others = allSigners.slice(weights.length);
  const [deployer] = approvers;

  const group = toGroup(
    ...approvers.map((approver, i): [string, number] => [
      approver.address,
      weights[i],
    ]),
  );

  const deployData = await deploySafe(deployer, group);

  return {
    ...deployData,
    deployer,
    approvers,
    others,
    priorBlock,
    group,
    groupHash: hashGroup(group),
  };
};

describe('Deployer', async () => {
  it('Counterfactual matches deploy address', async () => {
    const signer = (await ethers.getSigners())[0];
    const factory = await getOrCreateFactory(signer);
    const group = toGroup([signer.address, 100]);

    const { addr: cfAddress, salt } = getCounterfactualAddress(factory, group);
    const actualAddr = await factory.callStatic.create(salt, group);

    expect(cfAddress).to.eq(actualAddr);
  });

  it('Deploys', async () => {
    const signer = (await ethers.getSigners())[0];
    const group = toGroup([signer.address, 100]);

    const { safe, deployTx } = await deploySafe(signer, group);
    expect(deployTx).to.emit(safe, SafeEvent.GroupAdded);
  });
});
