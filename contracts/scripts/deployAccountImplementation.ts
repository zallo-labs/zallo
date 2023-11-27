import { exit } from 'process';
import { deploy } from '../test/util';
import { displayTx } from './util/display';
import { verify } from './util/verify';
import hardhat from 'hardhat';

const main = async () => {
  await hardhat.run('compile');

  const { address, deployTx } = await deploy('Account');
  if (deployTx) await displayTx(address, deployTx);

  // TODO: re-enable once zksync system contracts cyclic dependencies issue has been fixed
  await verify({ contract: 'contracts/Account.sol:Account', address });
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
