import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useAccountCreatedSubscription } from './useAccountCreatedSubscription';
import {
  GlobalSubscriptionsQuery,
  GlobalSubscriptionsQuery$data,
} from '~/api/__generated__/GlobalSubscriptionsQuery.graphql';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { ZERO_ADDR } from 'lib';
import { O } from 'ts-toolbelt';
import { useTransfersSubscription } from './useTransfersSubscription';
import { useProposalAddedSubscription } from './useProposalAddedSubscription';

export function GlobalSubscriptions() {
  const selectedAccount = useSelectedAccount();
  const query = useLazyLoadQuery<GlobalSubscriptionsQuery>(
    graphql`
      query GlobalSubscriptionsQuery($account: UAddress!, $skipAccount: Boolean!) {
        account(address: $account) @skip(if: $skipAccount) {
          ...useTransfersSubscription_account
          ...useProposalAddedSubscription_account
        }

        ...useAccountCreatedSubscription_query
      }
    `,
    { account: selectedAccount ?? `zksync:${ZERO_ADDR}`, skipAccount: !selectedAccount },
  );

  useAccountCreatedSubscription({ query });

  if (!query.account) return null;

  return <SelectedAccountSubscriptions query={query as QueryWithAccount} />;
}

type QueryWithAccount = O.NonNullable<
  O.Required<GlobalSubscriptionsQuery$data, 'account'>,
  'account'
>;

interface SelectedAccountSubscriptionsProps {
  query: QueryWithAccount;
}

function SelectedAccountSubscriptions({ query }: SelectedAccountSubscriptionsProps) {
  const { account } = query;

  useTransfersSubscription({ account });
  useProposalAddedSubscription({ account });

  return null;
}
