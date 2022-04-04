import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { _100_PERCENT_WEIGHT } from 'lib';
import { useWallet } from '@features/wallet/wallet.provider';
import { apiSafeToSafeData, API_SAFE_FIELDS } from '@queries';
import { CreateCfSafe, CreateCfSafeVariables } from '@gql/apiTypes';
import { apiGql, API_CLIENT } from '@gql/clients';

const API_MUTATION = apiGql`
${API_SAFE_FIELDS}
mutation CreateCfSafe($approvers: [ApproverInput!]!) {
    createCfSafe(approvers: $approvers) {
      ...SafeFields
    }
}
`;

export const useCreateCfSafe = () => {
  const wallet = useWallet();

  const [createRaw] = useMutation<CreateCfSafe, CreateCfSafeVariables>(API_MUTATION, {
    client: API_CLIENT,
    variables: {
      approvers: [
        {
          addr: wallet.address,
          weight: _100_PERCENT_WEIGHT.toString(),
        },
      ],
    },
  });

  const create = useCallback(
    async (options?: Parameters<typeof createRaw>[0]) => {
      const { data, ...rest } = await createRaw(options);
      const safe = data ? apiSafeToSafeData(data.createCfSafe, wallet) : undefined;

      return { safe, ...rest };
    },
    [createRaw, wallet],
  );

  return create;
};
