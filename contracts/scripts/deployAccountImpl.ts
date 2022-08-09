import { deployAccountImpl } from '../test/util';
import { displayTx } from './display';

const main = async () => {
  const { impl, deployTx } = await deployAccountImpl();

  await displayTx(impl, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
