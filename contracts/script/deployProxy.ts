import hre from 'hardhat';
import { exit } from 'process';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import AccountProxy from './contracts/AccountProxy';
import { deploy } from './util/deploy';

const ACCOUNT = '0x696532D64a358a4CC2eCDBE698a4a08c7841af8c';

// Deploys an uninitialized proxy
// Used for first-time proxy bytecode deployment
const main = async () => {
  await hre.run(TASK_COMPILE);
  await deploy(AccountProxy, [ACCOUNT, '0x']);
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
