import { gql } from '@apollo/client';
import {
  useProposalSubscriptionSubscription,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  ProposalsMetadataDocument,
  ProposalMetadataFieldsFragmentDoc,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';

gql`
  ${ProposalMetadataFieldsFragmentDoc}

  subscription ProposalMetadataSubscription(
    $accounts: [Address!]
    $proposals: [Bytes32!]
    $events: [ProposalEvent!]
  ) {
    proposal(accounts: $accounts, proposals: $proposals, events: $events) {
      ...ProposalMetadataFields
    }
  }
`;

export interface ProposalMetadataSubscriptionOptions extends ProposalsMetadataQueryVariables {
  skip?: boolean;
}

export const useProposalMetadataSubscription = ({
  skip,
  ...proposalsMetadataVariables
}: ProposalMetadataSubscriptionOptions = {}) =>
  useProposalSubscriptionSubscription({
    variables: { accounts: proposalsMetadataVariables.accounts },
    skip,
    onData: ({ data: { data }, client: { cache } }) => {
      const proposal = data?.proposal;
      if (!proposal) return;

      updateQuery<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>({
        cache,
        query: ProposalsMetadataDocument,
        variables: proposalsMetadataVariables,
        defaultData: { proposals: [] },
        updater: (data) => {
          const i = data.proposals.findIndex((p) => p.id === proposal.id);
          data.proposals[i >= 0 ? i : data.proposals.length] = proposal;
        },
      });
    },
  });
