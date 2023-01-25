import { gql } from '@apollo/client';
import { Address, MaybeArray, toArray } from 'lib';
import {
  ProposalEvent,
  ProposalFieldsFragmentDoc,
  useProposalSubscriptionSubscription,
  ProposalQuery,
  ProposalQueryVariables,
  ProposalDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  ProposalsMetadataDocument,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { ProposalId } from '.';

gql`
  ${ProposalFieldsFragmentDoc}

  subscription ProposalSubscription(
    $accounts: [Address!]
    $proposals: [Bytes32!]
    $events: [ProposalEvent!]
  ) {
    proposal(accounts: $accounts, proposals: $proposals, events: $events) {
      ...ProposalFields
    }
  }
`;

export interface ProposalSubscriptionOptions {
  accounts?: MaybeArray<Address>;
  proposals?: MaybeArray<ProposalId>;
  events?: MaybeArray<ProposalEvent>;
  skip?: boolean;
}

export const useProposalSubscription = ({
  accounts,
  proposals,
  events,
  skip,
}: ProposalSubscriptionOptions = {}) =>
  useProposalSubscriptionSubscription({
    variables: {
      accounts,
      proposals: proposals ? toArray(proposals).map((p) => p.id) : undefined,
      events,
    },
    skip,
    onData: ({ data: { data }, client: { cache } }) => {
      const proposal = data?.proposal;
      if (!proposal) return;

      updateQuery<ProposalQuery, ProposalQueryVariables>({
        cache,
        query: ProposalDocument,
        variables: { id: proposal.id },
        defaultData: { proposal: undefined },
        updater: (data) => {
          data.proposal = proposal;
        },
      });
    },
  });
