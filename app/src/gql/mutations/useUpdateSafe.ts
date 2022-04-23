import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { useSafe } from '@features/safe/SafeProvider';
import { apiGql } from '@gql/clients';
import {
  SafeUpdateInput,
  UpdateSafe,
  UpdateSafeVariables,
} from '@gql/api.generated';
import { useApiClient } from '@gql/GqlProvider';
import { API_SAFE_FIELDS } from '@queries';

const API_UPDATE_SAFE_MUTATION = apiGql`
${API_SAFE_FIELDS}
mutation UpdateSafe($safe: String!, $data: SafeUpdateInput!) {
  updateSafe(where: { id: $safe}, data: $data) {
    ...SafeFields
  }
}
`;

export const useUpdateSafe = () => {
  const { safe } = useSafe();

  const [updateRaw] = useMutation<UpdateSafe, UpdateSafeVariables>(
    API_UPDATE_SAFE_MUTATION,
    {
      client: useApiClient(),
    },
  );

  const update = useCallback(
    (data: SafeUpdateInput) =>
      updateRaw({
        variables: {
          safe: safe.address,
          data,
        },
      }),
    [safe, updateRaw],
  );

  return update;
};
