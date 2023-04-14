import { gql } from '@apollo/client';
import { PolicyId } from 'lib';
import { useCallback } from 'react';
import { PolicyFieldsFragmentDoc, useRemovePolicyMutation } from '@api/generated';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation RemovePolicy($args: UniquePolicyInput!) {
    removePolicy(args: $args) {
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
          args: {
            account,
            key,
          },
        },
      }),
    [mutate],
  );
};
