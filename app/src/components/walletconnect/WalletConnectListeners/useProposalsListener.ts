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
    proposalUpdated(input: { accounts: $accounts, events: [executed, signed] }) {
      id
      event
      proposal {
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
  }
`);

export type ApprovedProposal = NonNullable<
  UseProposalsListenerSubscriptionSubscription['proposalUpdated']['proposal']
>;

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
        data?.proposalUpdated.proposal && proposals.next(data.proposalUpdated.proposal);
      });

    return subscription.unsubscribe;
  }, [accounts, api, proposals]);

  return proposals;
}
