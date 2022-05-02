import { toGroup } from 'lib';
import { USDC, wallet } from '../test/util/wallet';
import { deploySafeDirect } from '../test/util/deploy';
import { displayTx } from './display';

const main = async () => {
  const group = toGroup([wallet.address, 100]);
  const { safe, deployTx } = await deploySafeDirect([group], USDC);

  await displayTx(safe.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
