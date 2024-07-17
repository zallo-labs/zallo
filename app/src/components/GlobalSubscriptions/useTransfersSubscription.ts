import { useMemo } from 'react';
import { useFragment, useSubscription } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import {
  useTransfersSubscription$data,
  type useTransfersSubscription,
} from '~/api/__generated__/useTransfersSubscription.graphql';
import { useTransfersSubscription_account$key } from '~/api/__generated__/useTransfersSubscription_account.graphql';
import { useTransfersSubscriptionUpdatableQuery } from '~/api/__generated__/useTransfersSubscriptionUpdatableQuery.graphql';
import { useLatestRef } from '~/hooks/useLatestRef';

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

  const updater = useLatestRef(
    useMemo(
      (): SelectorStoreUpdater<useTransfersSubscription$data> => (store, data) => {
        const t = data?.transfer;
        if (!t) return;

        // TODO: Invalidate Token.balance; disabled to prevent home screen from suspending whilst re-fetching
        // if (t.token) store.get(t.token.id)?.invalidateRecord();

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
      [account.address, account.transfers],
    ),
  );

  useSubscription<useTransfersSubscription>(
    useMemo(() => {
      return {
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
        updater: updater.current,
      };
    }, [account.address, updater]),
  );
}
