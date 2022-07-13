import { useMutation } from '@apollo/client';
import { UseFaucet, UseFaucetVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { Address } from 'lib';
import { useCallback } from 'react';

const MUTATION = apiGql`
mutation UseFaucet($recipient: Address!) {
  requestFunds(recipient: $recipient)
}
`;

export const useFaucet = (recipient: Address) => {
  const [mutation] = useMutation<UseFaucet, UseFaucetVariables>(MUTATION, {
    client: useApiClient(),
    variables: { recipient },
  });

  return useCallback(() => mutation(), [mutation]);
};
