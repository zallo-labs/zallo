import { useMemo } from 'react';
import { useAtomValue } from 'jotai';

import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { SYNCSWAP_POOL_FAMILY } from '~/util/swap/syncswap/pools';

export function useSwappableTokens(chain: Chain) {
  const pools = useAtomValue(SYNCSWAP_POOL_FAMILY(chain));

  return useMemo(
    () => [...new Set(pools.flatMap((p) => p.pair).map((t) => asUAddress(t, chain)))],
    [chain, pools],
  );
}
