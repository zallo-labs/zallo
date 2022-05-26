import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { useSafe } from '@features/safe/SafeProvider';
import { apiGql } from '@gql/clients';
import { UpsertSafe, UpsertSafeVariables } from '@gql/api.generated';
import { useApiClient } from '@gql/GqlProvider';
import { API_SAFE_FIELDS_FRAGMENT, CombinedSafe } from '@queries';
import { ethers } from 'ethers';

const API_UPDATE_SAFE_MUTATION = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

mutation UpsertSafe(
  $safe: String!
  $create: SafeCreateInput!
  $update: SafeUpdateInput!
) {
  upsertSafe(where: { id: $safe }, create: $create, update: $update) {
    ...SafeFields
  }
}
`;

export type SafeUpdate = Pick<CombinedSafe, 'name' | 'deploySalt'>;

export const useUpsertSafe = () => {
  const { safe } = useSafe();

  const [mutation] = useMutation<UpsertSafe, UpsertSafeVariables>(
    API_UPDATE_SAFE_MUTATION,
    {
      client: useApiClient(),
    },
  );

  const upsert = useCallback(
    (s: SafeUpdate) => {
      const deploySalt = s.deploySalt
        ? ethers.utils.hexlify(s.deploySalt)
        : undefined;

      return mutation({
        variables: {
          safe: safe.address,
          create: {
            id: safe.address,
            ...s,
            deploySalt,
          },
          update: {
            ...(s.name && { name: { set: s.name } }),
            ...(deploySalt && { deploySalt: { set: deploySalt } }),
          },
        },
      });
    },
    [safe, mutation],
  );

  return upsert;
};
