import { Chain } from 'chains';
import { useAtomValue } from 'jotai';
import { asUAddress } from 'lib';
import { useMemo } from 'react';
import { SYNCSWAP_POOL_FAMILY } from '~/util/swap/syncswap/pools';

export function useSwappableTokens(chain: Chain) {
  const pools = useAtomValue(SYNCSWAP_POOL_FAMILY(chain));

  return useMemo(
    () => [...new Set(pools.flatMap((p) => p.pair).map((t) => asUAddress(t, chain)))],
    [chain, pools],
  );
}
