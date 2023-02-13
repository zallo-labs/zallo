import { deployMulticall } from '../test/util/deploy';
import { displayTx } from './util/display';

const main = async () => {
  const { multicall, deployTx } = await deployMulticall();

  await displayTx(multicall.address, deployTx);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
