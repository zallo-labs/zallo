import { exit } from 'process';
import { deployFactory } from '../test/util';
import { displayTx } from './util/display';
import hardhat from 'hardhat';
import { verify } from './util/verify';

const main = async () => {
  await hardhat.run('compile');

  const { address, deployTx, constructorArgs } = await deployFactory('Factory');
  await displayTx(address, deployTx);

  await verify({
    contract: 'contracts/Factory.sol:Factory',
    address,
    constructorArguments: constructorArgs,
  });
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
