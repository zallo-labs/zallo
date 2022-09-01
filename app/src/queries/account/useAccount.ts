import { Address } from 'lib';
import { useMemo } from 'react';
import { combine, combineRest, simpleKeyExtractor } from '~/gql/combine';
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
      active: true,
      name: a.name,
      walletIds: combine(s.walletIds, a.walletIds, simpleKeyExtractor('ref'), {
        either: ({ sub, api }) => {
          if (!sub) return api!;

          sub.active = true;
          if (!api) return sub;

          return { ...api, ...sub };
        },
      }),
    };
  }, [a, s]);

  return { account, ...rest };
};
