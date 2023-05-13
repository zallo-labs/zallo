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

      // Add account id if missing
      updateQuery<AccountIdsQuery, AccountIdsQueryVariables>({
        cache,
        query: AccountIdsDocument,
        variables: {},
        defaultData: { accounts: [] },
        updater: (data) => {
          if (!data.accounts.find((a) => compareAddress(a.address, account.address)))
            data.accounts.push({ __typename: 'Account', id: account.id, address: account.address });
        },
      });
    },
  });
