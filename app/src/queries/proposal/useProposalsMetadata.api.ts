import { gql } from '@apollo/client';
import { address, Address, Id, MaybeArray, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  ProposalState,
} from '~/gql/generated.api';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { useProposalMetadataSubscription } from './useProposalMetadataSubscription.api';

export interface ProposalMetadata {
  id: Id;
  account: Address;
  hash: string;
  timestamp: DateTime;
}

gql`
  fragment ProposalMetadataFields on Proposal {
    id
    accountId
    createdAt
  }

  query ProposalsMetadata(
    $accounts: [Address!]
    $states: [ProposalState!]
    $actionRequired: Boolean
  ) {
    proposals(accounts: $accounts, states: $states, actionRequired: $actionRequired) {
      ...ProposalMetadataFields
    }
  }
`;

export interface ProposalsMetadataOptions {
  accounts?: MaybeArray<Address>;
  states?: MaybeArray<ProposalState>;
  actionRequired?: boolean;
}

export const useProposalsMetadata = ({
  accounts,
  states,
  actionRequired,
}: ProposalsMetadataOptions = {}) => {
  const variables: ProposalsMetadataQueryVariables = { accounts, states, actionRequired };
  const { data } = useSuspenseQuery<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>(
    ProposalsMetadataDocument,
    { variables },
  );
  useProposalMetadataSubscription(variables);

  const proposals = useMemo(
    () =>
      data.proposals.map(
        (p): ProposalMetadata => ({
          id: toId(p.id),
          account: address(p.accountId),
          hash: p.id,
          timestamp: DateTime.fromISO(p.createdAt),
        }),
      ),
    [data.proposals],
  );

  return proposals;
};
