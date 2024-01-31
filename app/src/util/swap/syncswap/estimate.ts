import { getNetwork } from '@network/network';
import { Chain } from 'chains';
import { SYNCSWAP } from 'lib/dapps';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';
import { ResultAsync, err } from 'neverthrow';
import { SimulateContractErrorType } from 'viem';
import { useSuspenseQuery } from '@tanstack/react-query';

const FOREVER_DEADLINE = 32531887598n;

export interface EstimateSwapParams {
  chain: Chain;
  route: SwapRoute;
  fromAmount: bigint;
}

export async function estimateSwap({ chain, route, fromAmount }: EstimateSwapParams) {
  const router = SYNCSWAP.router.address[chain];
  if (!router) return err('unsupported-network' as const);

  return ResultAsync.fromPromise(
    (async () =>
      (
        await getNetwork(chain).simulateContract({
          abi: SYNCSWAP.router.abi,
          address: router,
          functionName: 'swap',
          args: [[{ ...route, amountIn: fromAmount }], 0n, FOREVER_DEADLINE],
        })
      ).result.amount)(),
    (e) => e as SimulateContractErrorType,
  );
}

export function useEstimateSwap(props: EstimateSwapParams) {
  return useSuspenseQuery({
    queryFn: ({ queryKey: [_key, params] }) => estimateSwap(params),
    queryKey: ['estimate-swap', props] as const,
  }).data;
}
