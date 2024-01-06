import { getNetwork } from '@network/network';
import { Chain } from 'chains';
import { SYNCSWAP } from 'lib/dapps';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';
import { suspend } from 'suspend-react';
import { useMemo } from 'react';

const FOREVER_DEADLINE = 32531887598n;

export interface EstimateSwapParams {
  chain: Chain;
  route: SwapRoute;
  fromAmount: bigint;
}

export async function estimateSwap({ chain, route, fromAmount }: EstimateSwapParams) {
  return (
    await getNetwork(chain).simulateContract({
      abi: SYNCSWAP.router.abi,
      address: SYNCSWAP.router.address[chain],
      functionName: 'swap',
      args: [[{ ...route, amountIn: fromAmount }], 0n, FOREVER_DEADLINE],
    })
  ).result.amount;
}

export function useEstimateSwap(props: EstimateSwapParams) {
  return suspend(useMemo(() => estimateSwap(props), [props]));
}
