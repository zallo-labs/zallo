import hre from 'hardhat';
import { exit } from 'process';
import { deployFactory } from '../test/util';
import { displayTx } from './util/display';
import { verify } from './util/verify';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import AccountProxy from '../test/contracts/AccountProxy';

const main = async () => {
  await hre.run(TASK_COMPILE);

  const { address, deployTx, constructorArgs } = await deployFactory(AccountProxy);
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
