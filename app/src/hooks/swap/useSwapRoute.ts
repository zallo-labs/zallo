import { Address, ETH_ADDRESS, UAddress, ZERO_ADDR, asAddress, asChain } from 'lib';
import { useAtomValue } from 'jotai';
import { SYNCSWAP_POOL_FAMILY, SyncswapPool } from '~/util/swap/syncswap/pools';
import { encodeAbiParameters, getAbiItem } from 'viem';
import { WETH, SYNCSWAP } from 'lib/dapps';
import { AbiParameterToPrimitiveType } from 'abitype';

const item = getAbiItem({ abi: SYNCSWAP.router.abi, name: 'swap' });
export type SwapRoute = Omit<
  AbiParameterToPrimitiveType<(typeof item)['inputs'][0]>[0],
  'amountIn'
>;
type Steps = SwapRoute['steps'];

export interface GetRouteParams {
  account: UAddress;
  from: Address;
  to: Address | undefined;
}

export function useSwapRoute({ account, from, to }: GetRouteParams): SwapRoute | undefined {
  const pools = useAtomValue(SYNCSWAP_POOL_FAMILY(asChain(account)));
  if (!to) return undefined;

  const steps = shortestSteps(pools, account, from, to);
  if (!steps) return undefined;

  return {
    tokenIn: from, // ETH must be used for ETH
    steps,
  };
}

function shortestSteps(
  pools: SyncswapPool[],
  account: UAddress,
  from: Address,
  to: Address,
): Steps | undefined {
  const pool = pools.find((p) => p.pair.includes(from) && p.pair.includes(to));
  if (!pool) return undefined;

  // Withdraw mode - executed on last step
  // 0 - vault internal transfer
  // 1 - withdraw and unwrap to naitve ETH
  // 2 - withdraw and wrap to wETH
  const withdrawMode = from === ETH_ADDRESS ? 1 : 2;

  return [
    {
      pool: pool.address,
      data: encodeAbiParameters(
        [
          { name: 'tokenIn', type: 'address' }, // WETH must be used instead of ETH
          { name: 'to', type: 'address' },
          { name: 'withdrawMode', type: 'uint8' },
        ],
        [
          from === ETH_ADDRESS ? WETH.address[asChain(account)] : from,
          asAddress(account),
          withdrawMode,
        ],
      ),
      callback: ZERO_ADDR,
      callbackData: '0x',
    },
  ];
}
