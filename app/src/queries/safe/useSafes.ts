import { filterFirst } from 'lib';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';
import { CombinedSafe, CombinedGroup } from '.';
import { useApiSafes } from './useSafes.api';
import { useSubSafes } from './useSafes.sub';

export const useSafes = () => {
  const { data: subSafes, ...subRest } = useSubSafes();
  const { data: apiSafes, ...apiRest } = useApiSafes();

  const rest = combineRest(subRest, apiRest);

  const safes = apiSafes
    ? combine(
        subSafes,
        apiSafes,
        {
          api: (a) => a.safe.address,
          sub: (s) => s.safe.address,
        },
        {
          either: ({ sub: s, api: a }): CombinedSafe => {
            return {
              safe: s?.safe ?? a!.safe,
              name: a?.name || s?.name || '',
              deploySalt: a?.deploySalt ?? s?.deploySalt,
              impl: s?.impl ?? a!.impl,
              groups: combine(
                s?.groups ?? [],
                a?.groups ?? [],
                simpleKeyExtractor('id'),
                {
                  either: ({ sub, api }): CombinedGroup => ({
                    id: sub?.id ?? api!.id,
                    ref: sub?.ref ?? api!.ref,
                    active: sub?.active ?? api!.active,
                    approvers: filterFirst(
                      [...(sub?.approvers ?? []), ...(api?.approvers ?? [])],
                      (a) => a.addr,
                    ),
                    name: api?.name ?? sub?.name ?? '',
                  }),
                },
              ).filter((group) => group.active && group.approvers.length > 0),
            };
          },
        },
      ).filter((safe) => safe.groups.length)
    : [];

  return { safes, ...rest };
};
