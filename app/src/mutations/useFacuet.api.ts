import { gql, useMutation } from '@apollo/client';
import {
  UseFaucetMutation,
  UseFaucetMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Address } from 'lib';
import { useCallback } from 'react';

const MUTATION = gql`
  mutation UseFaucet($recipient: Address!) {
    requestFunds(recipient: $recipient)
  }
`;

export const useFaucet = (recipient: Address) => {
  const [mutation] = useMutation<UseFaucetMutation, UseFaucetMutationVariables>(
    MUTATION,
    {
      client: useApiClient(),
      variables: { recipient },
    },
  );

  return useCallback(() => mutation(), [mutation]);
};
