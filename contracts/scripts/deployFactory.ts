import { deployFactory } from '../test/util/deploy';
import { displayTx } from './display';

const main = async () => {
  const { factory, deployTx } = await deployFactory();

  await displayTx(factory.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
