import { getNetwork } from '@network/network';
import { Chain } from 'chains';
import { SYNCSWAP } from 'lib/dapps';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';
import { suspend } from 'suspend-react';
import { ResultAsync } from 'neverthrow';
import { SimulateContractErrorType } from 'viem';

const FOREVER_DEADLINE = 32531887598n;

export interface EstimateSwapParams {
  chain: Chain;
  route: SwapRoute;
  fromAmount: bigint;
}

export async function estimateSwap({ chain, route, fromAmount }: EstimateSwapParams) {
  return ResultAsync.fromPromise(
    (async () =>
      (
        await getNetwork(chain).simulateContract({
          abi: SYNCSWAP.router.abi,
          address: SYNCSWAP.router.address[chain],
          functionName: 'swap',
          args: [[{ ...route, amountIn: fromAmount }], 0n, FOREVER_DEADLINE],
        })
      ).result.amount)(),
    (e) => e as SimulateContractErrorType,
  );
}

export function useEstimateSwap(props: EstimateSwapParams) {
  return suspend(() => estimateSwap(props), ['estimate-swap', props.fromAmount.toString()]);
}
