import hre from 'hardhat';
import { exit } from 'process';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import Account from './contracts/AccountProxy';
import { deploy } from './util/deploy';

const ACCOUNT = '0xc0c1c0692F1aCd4FA91ccc73fB9aCFCd60Dd571a';

// Deploys an uninitialized proxy
// Used for first-time proxy bytecode deployment
const main = async () => {
  await hre.run(TASK_COMPILE);
  await deploy(Account, [ACCOUNT, '0x']);
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
