import { Operation, ZERO_ADDR, asHex, ERC20_ABI, isPresent } from 'lib';
import { EstimateSwapParams, GetSwapOperationsParams, TokenAmount } from '../types';
import { SYNCSWAP_ROUTER, SYNCSWAP_VAULT, getSyncswapPoolContract } from './contracts';
import { ETH, WETH } from '@token/tokens';
import { encodeAbiParameters, encodeFunctionData } from 'viem';
import { normalizeSyncswapPoolToken } from './util';
import { createTransferOp } from '~/screens/send/transfer';

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
    normalizeSyncswapPoolToken(from.token),
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
  // Withdraw mode - executed on last step
  // 0 - vault internal transfer
  // 1 - withdraw and unwrap to naitve ETH
  // 2 - withdraw and wrap to wETH
  const withdrawMode = from.token === WETH.address ? 2 : 1;

  const estimated = await estimateSwap({ pool, account, from });

  const minAmountOut =
    (estimated.amount * (SLIPPAGE_FACTOR_BN - BigInt(slippage * SLIPPAGE_FACTOR))) /
    SLIPPAGE_FACTOR_BN;

  const transferOp: Operation | undefined =
    from.token !== ETH.address
      ? {
          to: from.token,
          data: asHex(
            encodeFunctionData({
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [SYNCSWAP_ROUTER.address, from.amount],
            }),
          ),
        }
      : undefined;

  const swapOp: Operation = {
    to: SYNCSWAP_ROUTER.address,
    value: !transferOp ? from.amount : undefined,
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
                  data: encodeAbiParameters(
                    [
                      { name: 'tokenIn', type: 'address' },
                      { name: 'to', type: 'address' },
                      { name: 'withdrawMode', type: 'uint8' },
                    ],
                    [from.token, account, withdrawMode],
                  ),
                  callback: ZERO_ADDR,
                  callbackData: '0x',
                },
              ],
            },
          ],
          minAmountOut,
          BigInt(Math.round(deadline.toSeconds())),
        ],
      }),
    ),
  };

  return transferOp ? [transferOp, swapOp] : [swapOp];
};
