import { gql } from '@apollo/client';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  ProposalStatus,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface ProposalMetadata {
  id: Id;
  account: Address;
  hash: string;
  timestamp: DateTime;
}

gql`
  query ProposalsMetadata($accounts: AddressSet, $status: ProposalStatus) {
    proposals(accounts: $accounts, status: $status) {
      id
      accountId
      hash
      createdAt
    }
  }
`;

export interface ProposalsMetadataOptions {
  accounts?: Address[];
  status?: ProposalStatus;
}

export const useProposalsMetadata = ({
  accounts,
  status,
}: ProposalsMetadataOptions = {}) => {
  const { data, ...rest } = useSuspenseQuery<
    ProposalsMetadataQuery,
    ProposalsMetadataQueryVariables
  >(ProposalsMetadataDocument, {
    client: useApiClient(),
    variables: { accounts, status },
  });
  usePollWhenFocussed(rest, 10);

  const proposals = useMemo(
    () =>
      data.proposals.map(
        (p): ProposalMetadata => ({
          id: toId(p.hash),
          account: address(p.accountId),
          hash: p.hash,
          timestamp: DateTime.fromISO(p.createdAt),
        }),
      ),
    [data.proposals],
  );

  return [proposals, rest] as const;
};
