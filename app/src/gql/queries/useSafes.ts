import { useQuery } from '@apollo/client';
import { BytesLike, Signer } from 'ethers';

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
import { useWallet } from '@features/wallet/WalletProvider';
import { GetApiSafes, GetApiSafesVariables } from '@gql/api.generated';
import { GetSubSafes, GetSubSafesVariables } from '@gql/subgraph.generated';
import { subGql, apiGql } from '@gql/clients';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';
import { useApiClient, useSubgraphClient } from '@gql/GqlProvider';

const SUB_QUERY = subGql`
query GetSubSafes($approver: ID!) {
  approver(id: $approver) {
    groups {
      group {
        safe {
          id
          groups {
            id
            hash
            active
            approvers {
              weight
              approver {
                id
              }
            }
          }
        }
      }
    }
  }
}
`;

const useSubSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<GetSubSafes, GetSubSafesVariables>(
    SUB_QUERY,
    {
      client: useSubgraphClient(),
      variables: { approver: wallet.address.toLowerCase() },
    },
  );

  const safes =
    data?.approver?.groups.map((g) => ({
      ...g.group.safe,
      id: toId(g.group.safe.id),
    })) ?? [];

  return { data: filterUnique(safes, (safe) => toId(safe.id)), ...rest };
};

const subSafeToCombined = (
  sub: ArrVal<ReturnType<typeof useSubSafes>['data']>,
  wallet: Signer,
): CombinedSafe => {
  return {
    safe: getSafe(sub.id, wallet),
    groups: sub.groups.map((g) => ({
      id: toId(g.id),
      hash: g.hash,
      active: g.active,
      approvers: g.approvers.map((a) => ({
        addr: address(a.approver.id),
        weight: fixedWeightToPercent(a.weight),
      })),
    })),
  };
};

export const API_GROUP_FIELDS_FRAGMENT = apiGql`
fragment GroupFields on Group {
  id
  hash
  safeId
  approvers {
    approverId
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

const API_QUERY = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

query GetApiSafes($approver: String!, $safes: [String!]) {
  approver(where: { id: $approver }) {
    id
    safes {
      ...SafeFields
    }
  }

  safes(where: { id: { in: $safes, mode: insensitive } }) {
    ...SafeFields
  }
}
`;

const useApiSafes = () => {
  const wallet = useWallet();
  const { data: subSafes } = useSubSafes();

  const subSafeIds = subSafes.map((s) => address(s.id));
  const { data, ...rest } = useQuery<GetApiSafes, GetApiSafesVariables>(
    API_QUERY,
    {
      client: useApiClient(),
      variables: { approver: wallet.address, safes: subSafeIds },
      skip: !subSafeIds.length,
    },
  );

  const safes = filterUnique(
    [...(data?.approver?.safes ?? []), ...(data?.safes ?? [])].map((safe) => ({
      ...safe,
      id: toId(safe.id),
    })),
    (safe) => safe.id,
  );

  return { data: safes, ...rest };
};

export interface CombinedGroup {
  id: Id;
  hash: BytesLike;
  active: boolean;
  approvers: Approver[];
  name?: string;
}

export interface CombinedSafe {
  safe: Safe;
  name?: string;
  deploySalt?: BytesLike;
  groups: CombinedGroup[];
}

export const apiSafeToCombined = (
  api: ArrVal<ReturnType<typeof useApiSafes>['data']>,
  wallet: Signer,
): CombinedSafe => {
  const groups: CombinedGroup[] =
    api.groups?.map((g) => ({
      id: toId(g.id),
      hash: g.hash,
      active: true,
      approvers:
        g.approvers?.map((g) => ({
          addr: address(g.approverId),
          weight: fixedWeightToPercent(g.weight),
        })) ?? [],
      name: g.name,
    })) ?? [];

  return {
    safe: getSafe(api.id, wallet),
    name: api.name,
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
                  hash: sub?.hash ?? api?.hash,
                  active: sub?.active ?? api?.active,
                  approvers: filterUnique(
                    [...(sub?.approvers ?? []), ...(api?.approvers ?? [])],
                    (a) => a.addr,
                  ),
                  name: sub?.name ?? api?.name,
                }),
              },
            ).filter((group) => group.active && group.approvers.length > 0),
          };
        },
      }).filter((safe) => safe.groups.length)
    : undefined;

  return { safes, ...rest };
};
