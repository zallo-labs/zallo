import { compareAddress } from 'lib';
import {
  AccountsDocument,
  AccountsQuery,
  AccountsQueryVariables,
  useAccountSubscriptionSubscription,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';

export const AccountsSubscription = () => {
  useAccountSubscriptionSubscription({
    onData: ({ client: { cache }, data: { data } }) => {
      const account = data?.account;
      if (!account) return;

      updateQuery<AccountsQuery, AccountsQueryVariables>({
        cache,
        query: AccountsDocument,
        variables: {},
        defaultData: { accounts: [] },
        updater: (data) => {
          const i = data.accounts.findIndex((a) => compareAddress(a.id, account.id));
          data.accounts[i >= 0 ? i : data.accounts.length] = account;
        },
      });
    },
  });

  return null;
};
