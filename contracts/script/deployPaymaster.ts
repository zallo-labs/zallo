import hre from 'hardhat';
import { exit } from 'process';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import Paymaster from './contracts/Paymaster';
import { wallet } from './util/network';
import { zeroAddress } from 'viem';
import chalk from 'chalk';
import { CONFIG } from '../config';
import { DAI, ETH, PYTH, USDC, WETH, RETH, CBETH } from 'lib/dapps';
import { AbiParametersToPrimitiveTypes } from 'abitype';
import { deploy } from './util/deploy';

const constructorAbi = Paymaster.abi.find((item) => item.type === 'constructor') as Extract<
  (typeof Paymaster.abi)[number],
  { type: 'constructor' }
>;

type ConstructorArgs = AbiParametersToPrimitiveTypes<typeof constructorAbi.inputs>;

const main = async () => {
  await hre.run(TASK_COMPILE);

  const constructorArgs = getArgs();
  await deploy(Paymaster, constructorArgs);

  console.log(chalk.yellow('=========== Constructor args ==========='));
  console.log(constructorArgs);
  console.log(chalk.yellow('========================================'));
};

function getArgs(): ConstructorArgs {
  const chain = CONFIG.chain.key;
  const disabled = zeroAddress;

  return [
    wallet.account.address,
    {
      pyth: PYTH.address[chain],
      nativePriceId: ETH.pythUsdPriceId,
      dai: { token: DAI.address[chain] ?? disabled, priceId: DAI.pythUsdPriceId },
      usdc: { token: USDC.address[chain] ?? disabled, priceId: USDC.pythUsdPriceId },
      weth: { token: WETH.address[chain] ?? disabled, priceId: WETH.pythUsdPriceId },
      reth: { token: RETH.address[chain] ?? disabled, priceId: RETH.pythUsdPriceId },
      cbeth: { token: CBETH.address[chain] ?? disabled, priceId: CBETH.pythUsdPriceId },
    },
  ];
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
