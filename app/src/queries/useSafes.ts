import { useQuery } from '@apollo/client';
import { Signer } from 'ethers';

import {
  ArrVal,
  filterUnique,
  Safe,
  getSafe,
  fixedWeightToPercent,
  address,
  Approver,
  toId,
  Id,
} from 'lib';
import { useWallet } from '@features/wallet/useWallet';
import { subGql, apiGql } from '@gql/clients';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';
import { useApiClient, useSubgraphClient } from '@gql/GqlProvider';
import { SQuerySafes, SQuerySafesVariables } from '@gql/subgraph.generated';
import { AQueryUserSafes } from '@gql/api.generated';

const SUB_QUERY = subGql`
query SQuerySafes($user: ID!) {
  user(id: $user) {
    id
    approvers {
      approverSet {
        group {
          safe {
            id
            groups {
              id
              ref
              active
              approverSets(first: 1, orderBy: blockHash, orderDirection: desc) {
                id
                blockHash
                timestamp
                approvers {
                  user {
                    id
                  }
                  weight
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

export const useSubSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<SQuerySafes, SQuerySafesVariables>(
    SUB_QUERY,
    {
      client: useSubgraphClient(),
      variables: { user: toId(wallet.address) },
    },
  );

  const safes =
    data?.user?.approvers.map((a) => ({
      id: toId(a.approverSet.group.safe.id),
      groups: a.approverSet.group.safe.groups,
    })) ?? [];

  return { data: filterUnique(safes, (safe) => toId(safe.id)), ...rest };
};

const subSafeToCombined = (
  sub: ArrVal<ReturnType<typeof useSubSafes>['data']>,
  wallet: Signer,
): CombinedSafe => {
  return {
    safe: getSafe(sub.id, wallet),
    name: '',
    groups: sub.groups.map((g) => ({
      id: toId(g.id),
      ref: g.ref,
      active: g.active,
      name: '',
      approvers: g.approverSets[0].approvers.map((a) => ({
        addr: address(a.user.id),
        weight: fixedWeightToPercent(a.weight),
      })),
    })),
  };
};

export const API_GROUP_FIELDS_FRAGMENT = apiGql`
fragment GroupFields on Group {
  id
  ref
  safeId
  approvers {
    userId
    weight
  }
  name
}
`;

export const API_SAFE_FIELDS_FRAGMENT = apiGql`
${API_GROUP_FIELDS_FRAGMENT}

fragment SafeFields on Safe {
  id
  name
  deploySalt
  groups {
    ...GroupFields
  }
}
`;

export const AQUERY_USER_SAFES = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

query AQueryUserSafes {
  user {
    id
    safes {
      ...SafeFields
    }
  }
}
`;

const useApiSafes = () => {
  const { data, ...rest } = useQuery<AQueryUserSafes>(AQUERY_USER_SAFES, {
    client: useApiClient(),
  });

  const safes = filterUnique(
    (data?.user?.safes ?? []).map((safe) => ({
      ...safe,
      id: toId(safe.id),
    })),
    (safe) => safe.id,
  );

  return { data: safes, ...rest };
};

export interface CombinedGroup {
  id: Id;
  ref: string;
  active: boolean;
  approvers: Approver[];
  name: string;
}

export interface CombinedSafe {
  safe: Safe;
  name: string;
  deploySalt?: string;
  groups: CombinedGroup[];
}

export const apiSafeToCombined = (
  api: ArrVal<ReturnType<typeof useApiSafes>['data']>,
  wallet: Signer,
): CombinedSafe => {
  const groups: CombinedGroup[] =
    api.groups?.map((g) => ({
      id: toId(g.id),
      ref: g.ref,
      active: true,
      approvers:
        g.approvers?.map((g) => ({
          addr: address(g.userId),
          weight: parseFloat(g.weight),
        })) ?? [],
      name: g.name ?? '',
    })) ?? [];

  return {
    safe: getSafe(api.id, wallet),
    name: api.name ?? '',
    deploySalt: api.deploySalt,
    groups,
  };
};

export const useSafes = () => {
  const wallet = useWallet();

  const { data: subSafes, ...subRest } = useSubSafes();
  const { data: apiSafes, ...apiRest } = useApiSafes();

  const rest = combineRest(subRest, apiRest);

  const safes = apiSafes
    ? combine(subSafes, apiSafes, simpleKeyExtractor('id'), {
        either: ({ sub, api }): CombinedSafe => {
          const s = sub ? subSafeToCombined(sub, wallet) : undefined;
          const a = api ? apiSafeToCombined(api, wallet) : undefined;

          return {
            safe: s?.safe ?? a?.safe,
            name: a?.name || s?.name,
            deploySalt: s?.deploySalt ?? s?.deploySalt,
            groups: combine(
              s?.groups ?? [],
              a?.groups ?? [],
              simpleKeyExtractor('id'),
              {
                either: ({ sub, api }): CombinedGroup => ({
                  id: sub?.id ?? api?.id,
                  ref: sub?.ref ?? api?.ref,
                  active: sub?.active ?? api?.active,
                  approvers: filterUnique(
                    [...(sub?.approvers ?? []), ...(api?.approvers ?? [])],
                    (a) => a.addr,
                  ),
                  name: api?.name ?? sub?.name,
                }),
              },
            ).filter((group) => group.active && group.approvers.length > 0),
          };
        },
      }).filter((safe) => safe.groups.length)
    : undefined;

  return { safes, ...rest };
};
