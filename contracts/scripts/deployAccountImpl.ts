import { exit } from 'process';
import { deployAccountImpl } from '../test/util';
import { displayTx } from './util/display';
import { verify } from './util/verify';
import hardhat from 'hardhat';
import { Hex } from 'lib';

const main = async () => {
  await hardhat.run('compile');

  const { impl, deployTx } = await deployAccountImpl();
  await displayTx(impl, deployTx);

  // TODO: re-enable once zksync system contracts cyclic dependencies issue has been fixed
  await verify({
    contract: 'contracts/Account.sol:Account',
    address: impl,
    constructorArguments: '0x' as Hex,
  });
};

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
