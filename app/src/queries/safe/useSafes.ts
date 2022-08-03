import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useMemo } from 'react';
import { CombinedSafe } from '.';
import { useApiUserSafes } from './useSafes.api';
import { useSubUserSafes } from './useSafes.sub';

export const useSafes = () => {
  const { data: subSafes, ...subRest } = useSubUserSafes();
  const { data: apiSafes, ...apiRest } = useApiUserSafes();

  const rest = useMemo(() => combineRest(subRest, apiRest), [apiRest, subRest]);

  const safes = useMemo(
    () =>
      combine(subSafes, apiSafes, simpleKeyExtractor('id'), {
        either: ({ sub: s, api: a }): CombinedSafe => ({
          id: s?.id ?? a!.id,
          contract: s?.contract ?? a!.contract,
          impl: s?.impl ?? a!.impl,
          name: a?.name ?? '',
        }),
      }),
    [apiSafes, subSafes],
  );

  return { safes, ...rest };
};
