import { exit } from 'process';
import { deployFactory } from '../test/util';
import { displayTx } from './util/display';
import hardhat from 'hardhat';

const main = async () => {
  await hardhat.run('compile');

  const { factory, deployTx } = await deployFactory('ERC1967Proxy');
  await displayTx(factory.address, deployTx);

  // TODO: verify
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
