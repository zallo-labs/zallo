import { gql } from '@apollo/client';
import { PolicyId } from 'lib';
import { useCallback } from 'react';
import { PolicyFieldsFragmentDoc, useRemovePolicyMutation } from '@api/generated';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation RemovePolicy($input: UniquePolicyInput!) {
    removePolicy(input: $input) {
      ...PolicyFields
    }
  }
`;

export const useRemovePolicy = () => {
  const [mutate] = useRemovePolicyMutation();

  return useCallback(
    async ({ account, key }: PolicyId) =>
      await mutate({
        variables: {
          input: {
            account,
            key,
          },
        },
      }),
    [mutate],
  );
};
