import { Operation, ZERO_ADDR, asHex } from 'lib';
import { EstimateSwapParams, GetSwapOperationsParams, TokenAmount } from '../types';
import { SYNCSWAP_ROUTER, getSyncswapPoolContract } from './contracts';
import { WETH } from '@token/tokens';
import { encodeAbiParameters, encodeFunctionData } from 'viem';
import { normalizeSyncswapToken } from './util';

const SLIPPAGE_FACTOR = 10 ** 5;
const SLIPPAGE_FACTOR_BN = BigInt(SLIPPAGE_FACTOR);

export const estimateSwap = async ({
  pool,
  account,
  from,
}: EstimateSwapParams): Promise<TokenAmount> => {
  if (pool.type !== 'syncswap-classic' && pool.type !== 'syncswap-stable')
    throw new Error('Unsupported pool type');

  const contract = getSyncswapPoolContract(pool.contract, pool.type);

  const amount = await contract.read.getAmountOut([
    normalizeSyncswapToken(from.token),
    from.amount,
    account,
  ]);

  return { token: pool.pair[0] === from.token ? pool.pair[1] : pool.pair[0], amount };
};

export const getSwapOperations = async ({
  account,
  pool,
  from,
  slippage,
  deadline,
}: GetSwapOperationsParams): Promise<[Operation, ...Operation[]]> => {
  // Determine withdraw mode, to withdraw native ETH or wETH on last step.
  // 0 - vault internal transfer
  // 1 - withdraw and unwrap to naitve ETH
  // 2 - withdraw and wrap to wETH
  const withdrawMode = from.token === WETH.address ? 2 : 1;

  from.token = normalizeSyncswapToken(from.token);

  const swapData = asHex(
    encodeAbiParameters(
      [
        { name: 'tokenIn', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'withdrawMode', type: 'uint8' },
      ],
      [from.token, account, withdrawMode],
    ),
  );

  const estimated = await estimateSwap({ pool, account, from });

  const minAmountOut =
    (estimated.amount * (SLIPPAGE_FACTOR_BN - BigInt(slippage * SLIPPAGE_FACTOR))) /
    SLIPPAGE_FACTOR_BN;

  return [
    {
      to: SYNCSWAP_ROUTER.address,
      data: asHex(
        encodeFunctionData({
          abi: SYNCSWAP_ROUTER.abi,
          functionName: 'swap',
          args: [
            [
              {
                tokenIn: from.token,
                amountIn: from.amount,
                steps: [
                  {
                    pool: pool.contract,
                    data: swapData,
                    callback: ZERO_ADDR,
                    callbackData: '0x',
                  },
                ],
              },
            ],
            minAmountOut,
            BigInt(deadline.toSeconds()),
          ],
        }),
      ),
    },
  ];
};
