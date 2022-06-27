import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { useWallet } from '@features/wallet/useWallet';
import { apiSafeToCombined, API_SAFE_FIELDS_FRAGMENT } from '~/queries';
import { CreateCfSafe, CreateCfSafeVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { PERCENT_THRESHOLD, randomGroupRef, toId } from 'lib';

const API_MUTATION = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

mutation CreateCfSafe($group: GroupInput!) {
    createCfSafe(group: $group) {
      ...SafeFields
    }
}
`;

export const useCreateCfSafe = () => {
  const wallet = useWallet();

  const [mutation] = useMutation<CreateCfSafe, CreateCfSafeVariables>(
    API_MUTATION,
    {
      client: useApiClient(),
      variables: {
        group: {
          ref: randomGroupRef(),
          approvers: [
            {
              addr: wallet.address,
              weight: PERCENT_THRESHOLD,
            },
          ],
        },
      },
    },
  );

  const create = useCallback(
    async (options?: Parameters<typeof mutation>[0]) => {
      const { data, ...rest } = await mutation(options);
      const safe = data
        ? apiSafeToCombined(
            {
              ...data.createCfSafe,
              id: toId(data.createCfSafe.id),
            },
            wallet,
          )
        : undefined;

      return { safe, ...rest };
    },
    [mutation, wallet],
  );

  return create;
};
