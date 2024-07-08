import { useMemo } from 'react';
import { useFragment, useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { type useAccountCreatedSubscription } from '~/api/__generated__/useAccountCreatedSubscription.graphql';
import { useAccountCreatedSubscription_query$key } from '~/api/__generated__/useAccountCreatedSubscription_query.graphql';
import { useAccountCreatedSubscriptionUpdatableQuery } from '~/api/__generated__/useAccountCreatedSubscriptionUpdatableQuery.graphql';

graphql`
  fragment useAccountCreatedSubscription_assignable_account on Account @assignable {
    __typename
  }
`;

export interface AccountCreatedSubscriptionParams {
  query: useAccountCreatedSubscription_query$key;
}

export function useAccountCreatedSubscription(params: AccountCreatedSubscriptionParams) {
  const { accounts } = useFragment(
    graphql`
      fragment useAccountCreatedSubscription_query on Query {
        accounts {
          ...useAccountCreatedSubscription_assignable_account
        }
      }
    `,
    params.query,
  );

  return useSubscription<useAccountCreatedSubscription>(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useAccountCreatedSubscription {
            accountUpdated(input: { events: [created] }) {
              account {
                ...useAccountCreatedSubscription_assignable_account
              }
            }
          }
        `,
        variables: {},
        updater: (store, data) => {
          const account = data?.accountUpdated.account;
          if (!account) return;

          const { updatableData } =
            store.readUpdatableQuery<useAccountCreatedSubscriptionUpdatableQuery>(
              graphql`
                query useAccountCreatedSubscriptionUpdatableQuery @updatable {
                  accounts {
                    id
                    ...useAccountCreatedSubscription_assignable_account
                  }
                }
              `,
              {},
            );

          updatableData.accounts = [...accounts, account];
        },
      }),
      [accounts],
    ),
  );
}
