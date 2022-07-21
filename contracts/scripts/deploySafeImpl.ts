import { deploySafeImpl } from '../test/util';
import { displayTx } from './display';

const main = async () => {
  const { impl, deployTx } = await deploySafeImpl();

  await displayTx(impl, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
