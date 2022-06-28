import { useCallback, useMemo } from 'react';
import { useMutation } from '@apollo/client';

import { apiGql } from '@gql/clients';
import {
  AQueryUserSafes,
  AQueryUserSafesVariables,
  UpsertSafe,
  UpsertSafeVariables,
  UpsertSafe_upsertSafe,
} from '@gql/api.generated';
import { useApiClient } from '@gql/GqlProvider';
import { API_SAFE_FIELDS_FRAGMENT } from '~/queries';
import { BytesLike, hexlify } from 'ethers/lib/utils';
import { address, Address, toId } from 'lib';
import { QueryOpts } from '@gql/update';
import { AQUERY_USER_SAFES, useSubSafes } from '~/queries/useSafes';
import produce from 'immer';

const API_UPDATE_SAFE_MUTATION = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

mutation UpsertSafe($safe: Address!, $deploySalt: Bytes32, $name: String, $groups: [GroupInput!]) {
  upsertSafe(safe: $safe, deploySalt: $deploySalt, name: $name, groups: $groups) {
    ...SafeFields
  }
}
`;

const merge = (
  existing: UpsertSafe_upsertSafe,
  s: UpsertSafe_upsertSafe,
): UpsertSafe_upsertSafe => ({
  ...existing,
  deploySalt: s.deploySalt || existing.deploySalt,
  name: s.name || existing.name,
});

interface UpsertArgs {
  safe: Address;
  deploySalt?: BytesLike;
  name?: string;
}

export const useUpsertSafe = () => {
  const { data: subSafes } = useSubSafes();

  const subSafeIds = useMemo(
    () => subSafes.map((s) => address(s.id)),
    [subSafes],
  );

  const [mutation] = useMutation<UpsertSafe, UpsertSafeVariables>(
    API_UPDATE_SAFE_MUTATION,
    { client: useApiClient() },
  );

  const upsert = useCallback(
    ({ safe, deploySalt: hexSalt, name }: UpsertArgs) => {
      const deploySalt = hexSalt ? hexlify(hexSalt) : undefined;

      return mutation({
        variables: {
          safe,
          deploySalt,
          name,
        },
        optimisticResponse: {
          upsertSafe: {
            __typename: 'Safe',
            id: toId(safe),
            deploySalt: deploySalt ?? '',
            name: name ?? '',
            groups: [],
          },
        },
        update: (cache, { data: { upsertSafe: safe } }) => {
          const opts: QueryOpts<AQueryUserSafesVariables> = {
            query: AQUERY_USER_SAFES,
            variables: { safes: subSafeIds },
          };

          const data = cache.readQuery<
            AQueryUserSafes,
            AQueryUserSafesVariables
          >(opts);

          cache.writeQuery<AQueryUserSafes, AQueryUserSafesVariables>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              // Update existing safe object, otherwise insert a new one into the user's safe list
              const safeIndex = data.safes.findIndex((s) => s.id === safe.id);
              if (safeIndex >= 0) {
                data.safes[safeIndex] = merge(data.safes[safeIndex], safe);
              } else {
                const userSafeIndex = data.user.safes.findIndex(
                  (s) => s.id === safe.id,
                );
                if (userSafeIndex >= 0) {
                  data.user.safes[userSafeIndex] = merge(
                    data.user.safes[userSafeIndex],
                    safe,
                  );
                } else {
                  data.user.safes.push(safe);
                }
              }
            }),
          });
        },
      });
    },
    [mutation, subSafeIds],
  );

  return upsert;
};
