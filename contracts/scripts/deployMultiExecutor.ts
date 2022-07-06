import { USDC } from '../test/util/wallet';
import { deployMultiExecutor } from '../test/util/deploy';
import { displayTx } from './display';

const main = async () => {
  const { executor, deployTx } = await deployMultiExecutor(USDC);

  await displayTx(executor.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
