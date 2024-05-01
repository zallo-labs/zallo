import hre from 'hardhat';
import { exit } from 'process';
import { deploy } from '../test/util';
import { displayTx } from './util/display';
import { verify } from './util/verify';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import Account from '../test/contracts/Account';

const main = async () => {
  await hre.run(TASK_COMPILE);

  const { address, deployTx } = await deploy(Account, []);
  await displayTx(address, deployTx);

  await verify({ contract: 'src/Account.sol:Account', address });
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
