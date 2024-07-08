import { useMemo } from 'react';
import { useFragment, useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { type useTransfersSubscription } from '~/api/__generated__/useTransfersSubscription.graphql';
import { useTransfersSubscription_account$key } from '~/api/__generated__/useTransfersSubscription_account.graphql';
import { useTransfersSubscriptionUpdatableQuery } from '~/api/__generated__/useTransfersSubscriptionUpdatableQuery.graphql';

graphql`
  fragment useTransfersSubscription_assignable_transfer on Transfer @assignable {
    __typename
  }
`;

export interface UseTransfersSubscriptionParams {
  account: useTransfersSubscription_account$key;
}

export function useTransfersSubscription(params: UseTransfersSubscriptionParams) {
  const account = useFragment(
    graphql`
      fragment useTransfersSubscription_account on Account {
        address
        transfers(input: { incoming: true, internal: false }) {
          id
          ...useTransfersSubscription_assignable_transfer
        }
      }
    `,
    params.account,
  );

  useSubscription<useTransfersSubscription>(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useTransfersSubscription($account: UAddress!) {
            transfer(input: { accounts: [$account] }) {
              id
              token {
                id
                balance(input: { account: $account })
              }
              incoming
              internal
              ...useTransfersSubscription_assignable_transfer
              ...IncomingTransferItem_transfer
            }
          }
        `,
        variables: { account: account.address },
        updater: (store, data) => {
          const t = data?.transfer;
          if (!t) return;

          // Invalidate Token.balance
          if (t.token) store.get(t.token.id)?.invalidateRecord();

          // Prepend to Account.transfers
          if (t.incoming && !t.internal) {
            const { updatableData } =
              store.readUpdatableQuery<useTransfersSubscriptionUpdatableQuery>(
                graphql`
                  query useTransfersSubscriptionUpdatableQuery($account: UAddress!) @updatable {
                    account(address: $account) {
                      transfers(input: { incoming: true, internal: false }) {
                        id
                        ...useTransfersSubscription_assignable_transfer
                      }
                    }
                  }
                `,
                { account: account.address },
              );
            if (updatableData.account) updatableData.account.transfers = [t, ...account.transfers];
          }
        },
      }),
      [account],
    ),
  );
}
