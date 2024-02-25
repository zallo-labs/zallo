import { gql } from '@api';
import { useUrqlApiClient } from '@api/client';
import { UseProposalsListenerSubscriptionSubscription } from '@api/documents.generated';
import { useMemo, useEffect } from 'react';
import { Subject } from 'rxjs';
import { getOptimizedDocument, useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query UseProposalsListener {
    accounts {
      id
      address
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription UseProposalsListenerSubscription($accounts: [UAddress!]!) {
    proposal(input: { accounts: $accounts, events: [approved, executed] }) {
      __typename
      id
      ... on Transaction {
        systx {
          id
          hash
        }
      }
      ... on Message {
        signature
      }
    }
  }
`);

export type ApprovedProposal = UseProposalsListenerSubscriptionSubscription['proposal'];

export function useProposalsListener() {
  const api = useUrqlApiClient();
  const { accounts } = useQuery(Query).data;

  const proposals = useMemo(() => new Subject<ApprovedProposal>(), []);
  useEffect(() => proposals.unsubscribe, [proposals]);

  useEffect(() => {
    const subscription = api
      .subscription(getOptimizedDocument(Subscription), {
        accounts: accounts.map((a) => a.address),
      })
      .subscribe(({ data }) => {
        data && proposals.next(data.proposal);
      });

    return subscription.unsubscribe;
  }, [accounts, api, proposals]);

  return proposals;
}
