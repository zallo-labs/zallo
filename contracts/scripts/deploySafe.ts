import { USDC, wallet, deploySafeDirect, toSafeGroupTest } from '../test/util';
import { displayTx } from './display';

const main = async () => {
  const group = toSafeGroupTest([wallet.address, 100]);
  const { safe, deployTx } = await deploySafeDirect({ group }, USDC);

  await displayTx(safe.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
