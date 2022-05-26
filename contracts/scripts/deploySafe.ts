import { USDC, wallet } from '../test/util/wallet';
import { deploySafeDirect, toSafeGroupTest } from '../test/util/deploy';
import { displayTx } from './display';

const main = async () => {
  const group = toSafeGroupTest([wallet.address, 100]);
  const { safe, deployTx } = await deploySafeDirect([group.approvers], USDC);

  await displayTx(safe.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
