import { gql, useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { UserSafesQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { filterFirst, toId, address, getSafe } from 'lib';
import { CombinedGroup, CombinedSafe, QUERY_SAFES_POLL_INTERVAL } from '.';

export const API_GROUP_FIELDS_FRAGMENT = gql`
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

export const API_SAFE_FIELDS_FRAGMENT = gql`
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

export const AQUERY_USER_SAFES = gql`
  ${API_SAFE_FIELDS_FRAGMENT}

  query UserSafes {
    user {
      id
      safes {
        ...SafeFields
      }
    }
  }
`;

export const useApiSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<UserSafesQuery>(AQUERY_USER_SAFES, {
    client: useApiClient(),
    pollInterval: QUERY_SAFES_POLL_INTERVAL,
  });

  const safes = filterFirst(
    (data?.user?.safes ?? []).map((safe) => ({
      ...safe,
      id: toId(safe.id),
    })),
    (safe) => safe.id,
  );

  const combinedSafes: CombinedSafe[] = safes.map((s) => {
    const groups: CombinedGroup[] =
      s.groups?.map((g) => ({
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
      safe: getSafe(s.id, wallet),
      name: s.name ?? '',
      deploySalt: s.deploySalt ?? undefined,
      groups,
    };
  });

  return { data: combinedSafes, ...rest };
};
