import { gql } from '@apollo/client';
import { useUpdateAccountMutation } from '@api/generated';
import { useCallback } from 'react';
import { WAccount } from './types';

gql`
  mutation UpdateAccount($args: UpdateAccountInput!) {
    updateAccount(args: $args) {
      id
      name
    }
  }
`;

export interface UpdateAccountOptions {
  name: string;
}

export const useUpdateAccount = (account?: WAccount) => {
  const [mutate] = useUpdateAccountMutation();

  return useCallback(
    ({ name }: UpdateAccountOptions) =>
      account &&
      name !== account.name &&
      mutate({
        variables: { args: { id: account.id, name } },
        optimisticResponse: {
          updateAccount: {
            __typename: 'Account',
            id: account.id,
            name,
          },
        },
      }),
    [account, mutate],
  );
};
