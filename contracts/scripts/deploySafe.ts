import { USDC, wallet } from '../test/util/wallet';
import { deploySafeDirect, toSafeGroupTest } from '../test/util/deploy';
import { displayTx } from './display';
import { randomGroupId } from 'lib';

const main = async () => {
  const groupId = randomGroupId();
  const group = toSafeGroupTest([wallet.address, 100]);
  const { safe, deployTx } = await deploySafeDirect([groupId, group.approvers], USDC);

  await displayTx(safe.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
