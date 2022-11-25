import { gql } from '@apollo/client';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  useSetAccountNameMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import assert from 'assert';
import produce from 'immer';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/account/useAccount.api';
import { toId } from 'lib';

gql`
  mutation SetAccountName($account: Address!, $name: String!) {
    setAccountName(id: $account, name: $name) {
      id
    }
  }
`;

export const useSetAccountName = (account?: CombinedAccount) => {
  const [mutate] = useSetAccountNameMutation({ client: useApiClient() });

  return useCallback(
    (name: string) =>
      account &&
      name !== account.name &&
      mutate({
        variables: { account: account.addr, name },
        optimisticResponse: {
          setAccountName: {
            __typename: 'Account',
            id: toId(account.addr),
          },
        },
        update: (cache, res) => {
          if (!res.data?.setAccountName) return;

          // Account: set name
          const opts: QueryOpts<AccountQueryVariables> = {
            query: AccountDocument,
            variables: { account: account.addr },
          };

          const data = cache.readQuery<AccountQuery>(opts);
          assert(data?.account); // Should exist

          cache.writeQuery<AccountQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              data.account!.name = name;
            }),
          });
        },
      }),
    [account, mutate],
  );
};
