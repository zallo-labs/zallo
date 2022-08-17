import { combineRest } from '@gql/combine';
import { Address, filterFirst } from 'lib';
import { useMemo } from 'react';
import { CombinedAccount } from '.';
import { useApiAccount } from './useAccount.api';
import { useSubAccount } from './useAccount.sub';

export const useAccount = (addr?: Address) => {
  const { subAccount: s, ...subRest } = useSubAccount(addr);
  const { apiAccount: a, ...apiRest } = useApiAccount(addr);

  const rest = useMemo(() => combineRest(subRest, apiRest), [subRest, apiRest]);

  const account = useMemo((): CombinedAccount | undefined => {
    if (!s && !a) return undefined;
    if (!s) return a;
    if (!a) return s;

    return {
      ...a,
      ...s,
      name: a?.name ?? '',
      walletIds: filterFirst(
        [...(s?.walletIds ?? []), ...(a?.walletIds ?? [])],
        (w) => w.id,
      ),
    };
  }, [a, s]);

  return { account, ...rest };
};
