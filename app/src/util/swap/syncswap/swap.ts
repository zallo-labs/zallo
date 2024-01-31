import { Address, ETH_ADDRESS, Operation, UAddress, asChain } from 'lib';
import { ERC20, SYNCSWAP } from 'lib/dapps';
import { DateTime } from 'luxon';
import { err, ok } from 'neverthrow';
import { encodeFunctionData } from 'viem';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';
import { estimateSwap } from '~/util/swap/syncswap/estimate';

const SLIPPAGE_FACTOR = 10 ** 5;
const SLIPPAGE_FACTOR_BN = BigInt(SLIPPAGE_FACTOR);

export interface GetSwapOperationsParams {
  account: UAddress;
  route: SwapRoute;
  from: Address;
  fromAmount: bigint;
  slippage: number; // percent [0-1]
  deadline: DateTime;
}

export async function getSwapOperations({
  account,
  route,
  from,
  fromAmount,
  slippage,
  deadline,
}: GetSwapOperationsParams) {
  const chain = asChain(account);

  const router = SYNCSWAP.router.address[chain];
  if (!router) return err('unsupported-network' as const);

  const estimatedToAmount = await estimateSwap({ chain, route, fromAmount });
  if (estimatedToAmount.isErr()) return estimatedToAmount;

  const minimumToAmount =
    (estimatedToAmount.value * (SLIPPAGE_FACTOR_BN - BigInt(slippage * SLIPPAGE_FACTOR))) /
    SLIPPAGE_FACTOR_BN;

  const transferOp: Operation | undefined =
    from !== ETH_ADDRESS
      ? {
          to: from,
          data: encodeFunctionData({
            abi: ERC20,
            functionName: 'approve',
            args: [router, fromAmount],
          }),
        }
      : undefined;

  const swapOp: Operation = {
    to: router,
    value: !transferOp ? fromAmount : undefined,
    data: encodeFunctionData({
      abi: SYNCSWAP.router.abi,
      functionName: 'swap',
      args: [
        [{ ...route, amountIn: fromAmount }],
        minimumToAmount,
        BigInt(Math.round(deadline.toSeconds())),
      ],
    }),
  };

  const operations: [Operation, ...Operation[]] = transferOp ? [transferOp, swapOp] : [swapOp];
  return ok(operations);
}
