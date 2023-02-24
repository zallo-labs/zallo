import { deployAccountImpl } from '../test/util';
import { displayTx } from './util/display';
import { verify } from './util/verify';

const main = async () => {
  const { impl, deployTx } = await deployAccountImpl();

  await displayTx(impl, deployTx);

  // TODO: re-enable once zksync system contracts cyclic dependencies issue has been fixed
  // await verify({
  //   contract: 'contracts/Account.sol:Account',
  //   address: impl,
  //   constructorArguments: [],
  // });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
