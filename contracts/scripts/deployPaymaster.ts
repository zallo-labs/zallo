import hre from 'hardhat';
import { exit } from 'process';
import { deploy, wallet } from '../test/util';
import { displayTx } from './util/display';
import { verify } from './util/verify';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { abi } from '../test/contracts/TestPaymaster';
import { AbiParametersToPrimitiveTypes } from 'abitype';
import { CONFIG } from '../config';
import { DAI, ETH, PYTH, USDC, WETH, RETH, CBETH } from 'lib/dapps';
import { zeroAddress } from 'viem';

const constructorAbi = abi.find((item) => item.type === 'constructor') as Extract<
  (typeof abi)[number],
  { type: 'constructor' }
>;

type ConstructorArgs = AbiParametersToPrimitiveTypes<typeof constructorAbi.inputs>;

async function main() {
  await hre.run(TASK_COMPILE);

  const constructorArgs = getArgs();
  console.log(constructorArgs);

  const { address, deployTx } = await deploy('Paymaster', { constructorArgs });
  await displayTx(address, deployTx);

  await verify({
    contract: 'contracts/paymaster/Paymaster.sol:Paymaster',
    address,
    constructorArguments: constructorArgs,
  });
}

function getArgs(): ConstructorArgs {
  const chain = CONFIG.chain.key;
  const disabled = zeroAddress;

  return [
    wallet.account.address,
    wallet.account.address,
    {
      pyth: PYTH.address[chain],
      ethUsdPriceId: ETH.pythUsdPriceId,
      dai: { token: DAI.address[chain], usdPriceId: DAI.pythUsdPriceId },
      usdc: { token: USDC.address[chain], usdPriceId: USDC.pythUsdPriceId },
      weth: { token: WETH.address[chain], usdPriceId: WETH.pythUsdPriceId },
      reth: { token: RETH.address[chain] ?? disabled, usdPriceId: RETH.pythUsdPriceId },
      cbeth: { token: CBETH.address[chain] ?? disabled, usdPriceId: CBETH.pythUsdPriceId },
    },
  ];
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
