import { gql } from '@apollo/client';
import {
  AccountsDocument,
  AccountsQuery,
  AccountsQueryVariables,
  useUpdateAccountMetadataMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/account';
import assert from 'assert';

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

export const useUpdateAccountMetadata = (account?: CombinedAccount) => {
  const [mutate] = useUpdateAccountMetadataMutation();

  return useCallback(
    ({ name }: UpdateAccountMetadataOptions) =>
      account &&
      name !== account.name &&
      mutate({
        variables: { account: account.addr, name },
        optimisticResponse: {
          updateAccountMetadata: {
            __typename: 'Account',
            id: account.addr,
            name,
          },
        },
        update: (cache, res) => {
          const r = res.data?.updateAccountMetadata;
          if (!r) return;

          updateQuery<AccountsQuery, AccountsQueryVariables>({
            cache,
            query: AccountsDocument,
            variables: {},
            updater: (data) => {
              const i = data.accounts.findIndex((a) => a.id === r.id);
              assert(i >= 0);
              data.accounts[i].name = r.name;
            },
          });
        },
      }),
    [account, mutate],
  );
};
