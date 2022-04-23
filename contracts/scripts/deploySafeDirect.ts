import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Safe__factory, toGroup } from 'lib';
import { showTx } from './utils';

const main = async () => {
  const signer = (await ethers.getSigners())[0];

  const safe = await new Safe__factory()
    .connect(signer)
    .deploy(toGroup([signer.address, 100]), {
      gasLimit: BigNumber.from('3000000'),
    });

  await safe.deployed();

  console.log(`Deployed to: ${safe.address}`);
  await showTx(safe.deployTransaction.hash);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
