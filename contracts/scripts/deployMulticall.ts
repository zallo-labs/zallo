import { USDC } from '../test/util/wallet';
import { deployMulticall } from '../test/util/deploy';
import { displayTx } from './display';

const main = async () => {
  const { multicall, deployTx } = await deployMulticall(USDC);

  await displayTx(multicall.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
