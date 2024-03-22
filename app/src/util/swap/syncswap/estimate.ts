import { getNetwork } from '@network/network';
import { SYNCSWAP } from 'lib/dapps';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';
import { err, fromPromise } from 'neverthrow';
import { ReadContractErrorType } from 'viem';
import { useSuspenseQuery } from '@tanstack/react-query';
import { UAddress, asAddress, asChain } from 'lib';

export interface EstimateSwapParams {
  account: UAddress;
  route: SwapRoute;
  fromAmount: bigint;
}

export async function estimateSwap({ account, route, fromAmount }: EstimateSwapParams) {
  const chain = asChain(account);
  const router = SYNCSWAP.router.address[chain];
  if (!router) return err('unsupported-network' as const);

  // const ops = getSwapOperations({ account, route, from: route.tokenIn, fromAmount });
  // if (ops.isErr()) return ops.error;
  // TODO: simulate swap operations instead (more generic)

  const network = getNetwork(chain);
  return fromPromise(
    (async () => {
      let amountOut = fromAmount;
      for (let i = 0; i < route.steps.length; ++i) {
        amountOut = await network.readContract({
          address: route.steps[i].pool,
          abi: SYNCSWAP.poolAbi,
          functionName: 'getAmountOut',
          args: [route.stepsTokenIn[i], amountOut, asAddress(account)],
        });
      }

      return amountOut;
    })(),
    (e) => e as ReadContractErrorType,
  );
}

export function useEstimateSwap(props: EstimateSwapParams) {
  return useSuspenseQuery({
    queryFn: ({ queryKey: [_key, params] }) => estimateSwap(params),
    queryKey: ['estimate-swap', props] as const,
  }).data;
}
