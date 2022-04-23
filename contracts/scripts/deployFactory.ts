import { ethers } from 'hardhat';
import { deploySafeFactory } from 'lib';
import { showTx } from './utils';

const main = async () => {
  const signer = (await ethers.getSigners())[0];

  const factory = await deploySafeFactory(signer);

  console.log(`Factory deployed to: ${factory.address}`);
  await showTx(factory.deployTransaction.hash);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
