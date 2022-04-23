import { BytesLike } from 'ethers';
import { ethers } from 'hardhat';
import {
  toGroup,
  deploySafe,
  getCounterfactualAddress,
  deployFactory,
  hashGroup,
  SafeEvent,
  getRandomSalt,
  Safe__factory,
} from 'lib';

import { expect } from './util';

export const deploy = async (weights: number[], salt?: BytesLike) => {
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

  const factory = await deployFactory(deployer);
  const deployData = await deploySafe({
    deployer,
    factory,
    group,
    salt,
  });
  await deployData.safe.deployed();

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

describe('Factory', async () => {
  it('Deploys', async () => {
    const signer = (await ethers.getSigners())[0];
    await deployFactory(signer);
  });

  describe('Create', () => {
    it('Counterfactual matches deploy address', async () => {
      const signer = (await ethers.getSigners())[0];
      const factory = await deployFactory(signer);
      const group = toGroup([signer.address, 100]);

      const { addr: cfAddress, salt } = getCounterfactualAddress(
        factory,
        group,
      );
      const bytecode = new Safe__factory().getDeployTransaction(group).data!;

      const actualAddr = await factory.callStatic.create(bytecode, salt);

      expect(cfAddress).to.eq(actualAddr);
    });

    it('Deploys', async () => {
      const { safe, deployTx } = await deploy([100]);
      expect(deployTx).to.emit(safe, SafeEvent.GroupAdded);
    });

    it('Deploys with CF safe', async () => {
      const deployer = (await ethers.getSigners())[0];
      const factory = await deployFactory(deployer);

      const deployData = await deploySafe({
        deployer,
        factory,
        group: toGroup([deployer.address, 100]),
        salt: getRandomSalt(),
      });
      await deployData.safe.deployed();
    });
  });
});
