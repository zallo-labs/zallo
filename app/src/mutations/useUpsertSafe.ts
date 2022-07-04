import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { apiGql } from '@gql/clients';
import {
  AQueryUserSafes,
  UpsertSafe,
  UpsertSafeVariables,
} from '@gql/api.generated';
import { useApiClient } from '@gql/GqlProvider';
import { API_SAFE_FIELDS_FRAGMENT } from '~/queries';
import { Address, getGroupId, Safe, toId } from 'lib';
import { QueryOpts } from '@gql/update';
import {
  AQUERY_USER_SAFES,
  CombinedGroup,
  CombinedSafe,
} from '~/queries/useSafes';
import produce from 'immer';
import { useWallet } from '@features/wallet/useWallet';

const API_UPDATE_SAFE_MUTATION = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

mutation UpsertSafe($safe: Address!, $deploySalt: Bytes32, $name: String!, $groups: [GroupInput!]) {
  upsertSafe(safe: $safe, deploySalt: $deploySalt, name: $name, groups: $groups) {
    ...SafeFields
  }
}
`;

export type UpsertableGroup = Pick<CombinedGroup, 'ref' | 'approvers' | 'name'>;

export type UpsertSafeArgs = Pick<CombinedSafe, 'deploySalt' | 'name'> & {
  safe: Address | Safe;
  groups: UpsertableGroup[];
};

export const useUpsertSafe = () => {
  const wallet = useWallet();

  const [mutation] = useMutation<UpsertSafe, UpsertSafeVariables>(
    API_UPDATE_SAFE_MUTATION,
    { client: useApiClient() },
  );

  return useCallback(
    ({ safe: safeArg, deploySalt, name, groups }: UpsertSafeArgs) => {
      const safe = typeof safeArg === 'object' ? safeArg.address : safeArg;

      return mutation({
        variables: {
          safe,
          deploySalt: deploySalt ?? null,
          name,
          groups: groups.map((g) => ({
            ref: g.ref,
            name: g.name,
            approvers: g.approvers.map((a) => ({
              addr: a.addr,
              weight: a.weight,
            })),
          })),
        },
        optimisticResponse: {
          upsertSafe: {
            __typename: 'Safe',
            id: toId(safe),
            deploySalt: deploySalt ?? null,
            name,
            groups: groups.map((g) => ({
              __typename: 'Group',
              id: getGroupId(safe, g.ref),
              ref: g.ref,
              safeId: safe,
              name: g.name,
              approvers: g.approvers.map((a) => ({
                __typename: 'Approver',
                userId: a.addr,
                weight: a.weight,
              })),
            })),
          },
        },
        update: (cache, { data: { upsertSafe: safe } }) => {
          const opts: QueryOpts<never> = {
            query: AQUERY_USER_SAFES,
          };

          const data = cache.readQuery<AQueryUserSafes>(opts);

          cache.writeQuery<AQueryUserSafes>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              if (!data) {
                data = {
                  user: {
                    __typename: 'User',
                    id: wallet.address,
                    safes: [],
                  },
                };
              }

              const i = data.user.safes.findIndex((s) => s.id === safe.id);
              if (i >= 0) {
                data.user.safes[i] = safe;
              } else {
                data.user.safes.push(safe);
              }
            }),
          });
        },
      });
    },
    [mutation, wallet.address],
  );
};
