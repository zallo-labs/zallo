import { useMemo } from 'react';
import { useFragment, useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { type useProposalAddedSubscription } from '~/api/__generated__/useProposalAddedSubscription.graphql';
import { useProposalAddedSubscription_account$key } from '~/api/__generated__/useProposalAddedSubscription_account.graphql';
import { useProposalAddedSubscriptionUpdatableQuery } from '~/api/__generated__/useProposalAddedSubscriptionUpdatableQuery.graphql';

graphql`
  fragment useProposalAddedSubscription_assignable_proposal on Proposal @assignable {
    __typename
  }
`;

export interface UseProposalAddedSubscriptionParams {
  account: useProposalAddedSubscription_account$key;
}

export function useProposalAddedSubscription(params: UseProposalAddedSubscriptionParams) {
  const account = useFragment(
    graphql`
      fragment useProposalAddedSubscription_account on Account {
        address
        proposals {
          ...useProposalAddedSubscription_assignable_proposal
        }
      }
    `,
    params.account,
  );

  useSubscription<useProposalAddedSubscription>(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useProposalAddedSubscription($account: UAddress!) {
            proposalUpdated(input: { accounts: [$account], events: [create] }) {
              id
              proposal {
                id
                ...useProposalAddedSubscription_assignable_proposal
                ...TransactionItem_transaction
                ...MessageItem_message
              }
            }
          }
        `,
        variables: { account: account.address },
        updater: (store, data) => {
          const proposal = data?.proposalUpdated.proposal;
          if (!proposal) return;

          // Prepend to Account.proposals
          const { updatableData } =
            store.readUpdatableQuery<useProposalAddedSubscriptionUpdatableQuery>(
              graphql`
                query useProposalAddedSubscriptionUpdatableQuery($address: UAddress!) @updatable {
                  account(address: $address) {
                    proposals {
                      ...useProposalAddedSubscription_assignable_proposal
                    }
                  }
                }
              `,
              { address: account.address },
            );

          if (updatableData.account)
            updatableData.account.proposals = [proposal, ...account.proposals];
        },
      }),
      [account],
    ),
  );
}
