import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useMemo } from 'react';
import { CombinedAccount } from '.';
import { useApiUserAccounts } from './useAccounts.api';
import { useSubUserAccounts } from './useAccounts.sub';

export const useAccounts = () => {
  const { data: subAccounts, ...subRest } = useSubUserAccounts();
  const { data: apiAccounts, ...apiRest } = useApiUserAccounts();

  const rest = useMemo(() => combineRest(subRest, apiRest), [apiRest, subRest]);

  const accounts = useMemo(
    () =>
      combine(subAccounts, apiAccounts, simpleKeyExtractor('id'), {
        either: ({ sub: s, api: a }): CombinedAccount => ({
          id: s?.id ?? a!.id,
          contract: s?.contract ?? a!.contract,
          impl: s?.impl ?? a!.impl,
          name: a?.name ?? '',
        }),
      }),
    [apiAccounts, subAccounts],
  );

  return { accounts, ...rest };
};
