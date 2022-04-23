import { ethers } from 'hardhat';
import { toGroup, Safe__factory } from 'lib';

it('Deploy', async () => {
  const deployer = (await ethers.getSigners())[0];
  const group = toGroup([deployer.address, 100]);

  const safe = await new Safe__factory().connect(deployer).deploy(group);
  await safe.deployed();
});
