import { CHAIN, VIEM_CLIENT } from '@network/provider';
import { encodeAbiParameters, encodeFunctionData, getContract } from 'viem';
import { Address, ZERO_ADDR, asHex, compareAddress } from 'lib';
import { ETH, WETH } from '@token/tokens';
import vaultAbi from './vault.abi';
import routerAbi from './router.abi';
import classicPoolFactoryAbi from './classicPoolFactory.abi';
import stablePoolFactoryAbi from './stablePoolFactory.abi';
import classicPoolAbi from './classicPool.abi';
import stablePoolAbi from './stablePool.abi';

// https://syncswap.gitbook.io/api-documentation/resources/smart-contract
const ADDRESSES = {
  vault: {
    mainnet: '0x621425a1Ef6abE91058E9712575dcc4258F8d091',
    testnet: '0x4Ff94F499E1E69D687f3C3cE2CE93E717a0769F8',
    local: ZERO_ADDR,
  },
  router: {
    mainnet: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
    testnet: '0xB3b7fCbb8Db37bC6f572634299A58f51622A847e',
    local: ZERO_ADDR,
  },
  classicPoolFactory: {
    mainnet: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb',
    testnet: '0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006',
    local: ZERO_ADDR,
  },
  stablePoolFactory: {
    mainnet: '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3',
    testnet: '0xB6a70D6ab2dE494592546B696208aCEeC18D755f',
    local: ZERO_ADDR,
  },
} as const;

export const SYNCSWAP_VAULT = getContract({
  address: ADDRESSES.vault[CHAIN.key],
  abi: vaultAbi,
  publicClient: VIEM_CLIENT,
});

export const SYNCSWAP_ROUTER = getContract({
  address: ADDRESSES.router[CHAIN.key],
  abi: routerAbi,
  publicClient: VIEM_CLIENT,
});

export const SYNCSWAP_CLASSIC_POOL_FACTORY = getContract({
  address: ADDRESSES.classicPoolFactory[CHAIN.key],
  abi: classicPoolFactoryAbi,
  publicClient: VIEM_CLIENT,
});

export const SYNCSWAP_STABLE_POOL_FACTORY = getContract({
  address: ADDRESSES.stablePoolFactory[CHAIN.key],
  abi: stablePoolFactoryAbi,
  publicClient: VIEM_CLIENT,
});

export const getSyncswapPoolContract = (
  address: Address,
  type: 'syncswap-classic' | 'syncswap-stable',
) =>
  type === 'syncswap-classic'
    ? getSyncswapClassicPoolContract(address)
    : getSyncswapStablePoolContract(address);

export const getSyncswapClassicPoolContract = (address: Address) =>
  getContract({
    address,
    abi: classicPoolAbi,
    publicClient: VIEM_CLIENT,
  });

export const getSyncswapStablePoolContract = (address: Address) =>
  getContract({
    address,
    abi: stablePoolAbi,
    publicClient: VIEM_CLIENT,
  });

const getSwapOperation = async (
  account: Address,
  fromTokenParam: Address,
  fromAmount: bigint,
  toToken: Address,
) => {
  const fromToken = fromTokenParam === ETH.address ? WETH.address : fromTokenParam;
  const pair = [fromToken, toToken].sort(compareAddress) as [Address, Address];

  // Determine withdraw mode, to withdraw native ETH or wETH on last step.
  // 0 - vault internal transfer
  // 1 - withdraw and unwrap to naitve ETH
  // 2 - withdraw and wrap to wETH
  const withdrawMode = fromToken === WETH.address ? 2 : 1;

  const pool = await SYNCSWAP_CLASSIC_POOL_FACTORY.read.getPool(pair);

  const swapData = asHex(
    encodeAbiParameters(
      [
        { name: 'tokenIn', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'withdrawMode', type: 'uint8' },
      ],
      [fromToken, account, withdrawMode],
    ),
  );

  const minAmountOut = 0n; // factor in slippage

  const deadline = 0n; // no deadline

  const poolContract = getContract({
    address: pool,
    abi: classicPoolAbi,
    publicClient: VIEM_CLIENT,
  });

  const estimatedToAmount = poolContract.read.getAmountOut([fromToken, fromAmount, account]);

  encodeFunctionData({
    abi: SYNCSWAP_ROUTER.abi,
    functionName: 'swap',
    args: [
      [
        {
          tokenIn: fromToken,
          amountIn: fromAmount,
          steps: [
            {
              pool,
              data: swapData,
              callback: ZERO_ADDR,
              callbackData: '0x',
            },
          ],
        },
      ],
      minAmountOut,
      deadline,
    ],
  });
};
