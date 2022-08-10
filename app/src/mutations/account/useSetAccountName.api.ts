import { gql } from '@apollo/client';
import {
  AccountQuery,
  AccountQueryVariables,
  useSetAccountNameMutation,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import assert from 'assert';
import produce from 'immer';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/account';
import { API_ACCOUNT_QUERY } from '~/queries/account/useAccount.api';

gql`
  mutation SetAccountName($account: Address!, $name: String!) {
    setAccountName(id: $account, name: $name) {
      id
    }
  }
`;

export const useSetAccountName = () => {
  const [mutate] = useSetAccountNameMutation({ client: useApiClient() });

  return useCallback(
    ({ id, name }: CombinedAccount) =>
      mutate({
        variables: { account: id, name },
        optimisticResponse: {
          setAccountName: {
            __typename: 'Account',
            id,
          },
        },
        update: (cache, res) => {
          if (!res.data?.setAccountName) return;

          // Account
          const opts: QueryOpts<AccountQueryVariables> = {
            query: API_ACCOUNT_QUERY,
            variables: { account: id },
          };

          const data = cache.readQuery<AccountQuery>(opts);
          assert(data?.account); // Should exist

          cache.writeQuery<AccountQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              assert(data?.account);
              data.account.name = name;
            }),
          });
        },
      }),
    [mutate],
  );
};
