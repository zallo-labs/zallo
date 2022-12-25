import { gql } from '@apollo/client';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  ProposalState,
} from '~/gql/generated.api';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface ProposalMetadata {
  id: Id;
  account: Address;
  hash: string;
  timestamp: DateTime;
}

gql`
  query ProposalsMetadata(
    $accounts: [Address!]
    $state: [ProposalState!]
    $userHasApproved: Boolean
  ) {
    proposals(accounts: $accounts, state: $state, userHasApproved: $userHasApproved) {
      id
      accountId
      createdAt
    }
  }
`;

export interface ProposalsMetadataOptions {
  accounts?: Address[];
  state?: ProposalState | ProposalState[];
  userHasApproved?: boolean;
}

export const useProposalsMetadata = ({
  accounts,
  state,
  userHasApproved,
}: ProposalsMetadataOptions = {}) => {
  const { data, ...rest } = useSuspenseQuery<
    ProposalsMetadataQuery,
    ProposalsMetadataQueryVariables
  >(ProposalsMetadataDocument, {
    variables: { accounts, state, userHasApproved },
  });
  usePollWhenFocussed(rest, 10);

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

  return [proposals, rest] as const;
};
