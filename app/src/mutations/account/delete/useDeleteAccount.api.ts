import { gql } from '@apollo/client';
import {
  useDeleteAccountMutation,
  UserAccountsQuery,
  UserAccountsQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/accounts';
import { API_QUERY_USER_ACCOUNTS } from '~/queries/accounts/useAccounts.api';

gql`
  mutation DeleteAccount($id: AccountId!) {
    deleteAccount(id: $id)
  }
`;

export const useApiDeleteAccount = () => {
  const [mutate] = useDeleteAccountMutation({ client: useApiClient() });

  return useCallback(
    (account: CombinedAccount) =>
      mutate({
        variables: {
          id: { safeId: account.safeAddr, ref: account.ref },
        },
        optimisticResponse: {
          deleteAccount: true,
        },
        update: (cache, res) => {
          const success = res?.data?.deleteAccount;
          if (!success) return;

          const opts: QueryOpts<UserAccountsQueryVariables> = {
            query: API_QUERY_USER_ACCOUNTS,
            variables: {},
          };

          const data: UserAccountsQuery = cache.readQuery<UserAccountsQuery>(
            opts,
          ) ?? { userAccounts: [] };

          cache.writeQuery<UserAccountsQuery>({
            ...opts,
            overwrite: true,
            data: {
              userAccounts: data.userAccounts.filter(
                (acc) => acc.id !== account.id,
              ),
            },
          });
        },
      }),
    [mutate],
  );
};
