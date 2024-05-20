import hre from 'hardhat';
import { exit } from 'process';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import Deployer from './contracts/Deployer';
import { deploy } from './util/deploy';

const main = async () => {
  await hre.run(TASK_COMPILE);
  await deploy(Deployer);
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
