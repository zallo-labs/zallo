import { useMemo, useEffect } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { Subject } from 'rxjs';
import {
  useProposalsListenerSubscription,
  useProposalsListenerSubscription$data,
} from '~/api/__generated__/useProposalsListenerSubscription.graphql';

const Subscription = graphql`
  subscription useProposalsListenerSubscription {
    proposalUpdated(input: { events: [executed, signed] }) {
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
`;

export type ApprovedProposal = NonNullable<
  useProposalsListenerSubscription$data['proposalUpdated']['proposal']
>;

export function useProposalsListener() {
  const proposals = useMemo(() => new Subject<ApprovedProposal>(), []);
  useEffect(
    () => () => {
      proposals.complete();
    },
    [proposals],
  );

  useSubscription<useProposalsListenerSubscription>(
    useMemo(
      () => ({
        subscription: Subscription,
        variables: {},
        onNext: (data) => {
          data?.proposalUpdated.proposal && proposals.next(data.proposalUpdated.proposal);
        },
      }),
      [proposals],
    ),
  );

  return proposals;
}
