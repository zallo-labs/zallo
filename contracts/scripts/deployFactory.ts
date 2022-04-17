import { ethers } from 'hardhat';
import { getOrCreateFactory } from 'lib';

const showTx = async (txHash: string) => {
  const { name: network } = await ethers.provider.getNetwork();
  if (network.toLowerCase() === 'ropsten') {
    console.log(
      `View the deployment TX at https://${network}.etherscan.io/tx/${txHash}`,
    );
  }
};

const main = async () => {
  // await hre.run('compile'); // Compile before if run directly with node

  const signer = (await ethers.getSigners())[0];

  const factory = await getOrCreateFactory(signer);

  console.log(`Factory deployed to: ${factory.address}`);
  await showTx(factory.deployTransaction.hash);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
