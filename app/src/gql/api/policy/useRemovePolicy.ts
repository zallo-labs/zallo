import { gql } from '@apollo/client';
import { PolicyGuid } from 'lib';
import { useCallback } from 'react';
import { PolicyFieldsFragmentDoc, useRemovePolicyMutation } from '@api/generated';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation RemovePolicy($account: Address!, $key: PolicyKey!) {
    removePolicy(account: $account, key: $key) {
      ...PolicyFields
    }
  }
`;

export const useRemovePolicy = () => {
  const [mutate] = useRemovePolicyMutation();

  return useCallback(
    async ({ account, key }: PolicyGuid) =>
      await mutate({
        variables: {
          account,
          key,
        },
      }),
    [mutate],
  );
};
