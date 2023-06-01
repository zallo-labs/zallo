import { ExecuteInput, useExecuteMutation } from '@api/generated';
import { gql } from '@apollo/client';
import { useCallback } from 'react';

gql`
  mutation execute($input: ExecuteInput!) {
    execute(input: $input) {
      id
    }
  }
`;

export const useExecute = () => {
  const [mutate] = useExecuteMutation();

  return useCallback(
    async (input: ExecuteInput) => {
      const r = await mutate({ variables: { input } });

      return !!r.data?.execute;
    },
    [mutate],
  );
};
