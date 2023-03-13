import { gql } from '@apollo/client';
import { useUpdateAccountMetadataMutation } from '@api/generated';
import { useCallback } from 'react';
import { WAccount } from './types';

gql`
  mutation UpdateAccountMetadata($account: Address!, $name: String!) {
    updateAccountMetadata(id: $account, name: $name) {
      id
      name
    }
  }
`;

export interface UpdateAccountMetadataOptions {
  name: string;
}

export const useUpdateAccountMetadata = (account?: WAccount) => {
  const [mutate] = useUpdateAccountMetadataMutation();

  return useCallback(
    ({ name }: UpdateAccountMetadataOptions) =>
      account &&
      name !== account.name &&
      mutate({
        variables: { account: account.id, name },
        optimisticResponse: {
          updateAccountMetadata: {
            __typename: 'Account',
            id: account.id,
            name,
          },
        },
      }),
    [account, mutate],
  );
};
