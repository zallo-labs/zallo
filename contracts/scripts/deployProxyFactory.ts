import { deployFactory } from '../test/util';
import { displayTx } from './display';

const main = async () => {
  const { factory, deployTx } = await deployFactory('ERC1967Proxy');

  await displayTx(factory.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
