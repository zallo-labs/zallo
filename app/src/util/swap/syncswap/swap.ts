import { Address, ETH_ADDRESS, Operation, UAddress, asChain } from 'lib';
import { ERC20, SYNCSWAP } from 'lib/dapps';
import { DateTime } from 'luxon';
import { err, ok } from 'neverthrow';
import { encodeFunctionData } from 'viem';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';

const NEVER_EXPIRE = 32531887598n;

export interface GetSwapOperationsParams {
  account: UAddress;
  route: SwapRoute;
  from: Address;
  fromAmount: bigint;
  minimumToAmount?: bigint;
  deadline?: DateTime;
}

export interface EstimateMinSwapAmountParams {
  estimatedAmount: bigint;
  slippage: number; // percent [0-1]
}

export async function estimateMinSwapAmount({
  estimatedAmount,
  slippage,
}: EstimateMinSwapAmountParams) {
  const maxSlipped = (estimatedAmount * BigInt(slippage * 100)) / 100n;
  return estimatedAmount - maxSlipped;
}

export function getSwapOperations({
  account,
  route,
  from,
  fromAmount,
  minimumToAmount = 0n,
  deadline,
}: GetSwapOperationsParams) {
  const router = SYNCSWAP.router.address[asChain(account)];
  if (!router) return err('unsupported-network' as const);

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
        [{ steps: route.steps, tokenIn: route.tokenIn, amountIn: fromAmount }],
        minimumToAmount ?? 0n,
        deadline ? BigInt(Math.round(deadline.toSeconds())) : NEVER_EXPIRE,
      ],
    }),
  };

  const operations: [Operation, ...Operation[]] = transferOp ? [transferOp, swapOp] : [swapOp];
  return ok(operations);
}
