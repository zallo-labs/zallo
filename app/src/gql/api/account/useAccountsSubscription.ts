import { gql } from '@apollo/client';
import { compareAddress } from 'lib';
import {
  AccountFieldsFragmentDoc,
  AccountIdsDocument,
  AccountIdsQuery,
  AccountIdsQueryVariables,
  useAccountSubscriptionSubscription,
} from '@api/generated';
import { updateQuery } from '~/gql/util';

gql`
  ${AccountFieldsFragmentDoc}

  subscription AccountSubscription {
    account {
      ...AccountFields
    }
  }
`;

export const useAccountSubscription = () =>
  useAccountSubscriptionSubscription({
    onData: ({ client: { cache }, data: { data } }) => {
      const account = data?.account;
      if (!account) return;

      updateQuery<AccountIdsQuery, AccountIdsQueryVariables>({
        cache,
        query: AccountIdsDocument,
        variables: {},
        defaultData: { accounts: [] },
        updater: (data) => {
          const i = data.accounts.findIndex((a) => compareAddress(a.id, account.id));
          data.accounts[i >= 0 ? i : data.accounts.length] = account;
        },
      });
    },
  });
