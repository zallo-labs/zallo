import { gql } from '@apollo/client';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
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
  query ProposalsMetadata($accounts: AddressSet) {
    proposals(accounts: $accounts) {
      id
      accountId
      hash
      createdAt
    }
  }
`;

export const useProposalsMetadata = (accounts?: Address[]) => {
  const { data, ...rest } = useSuspenseQuery<
    ProposalsMetadataQuery,
    ProposalsMetadataQueryVariables
  >(ProposalsMetadataDocument, {
    client: useApiClient(),
    variables: { accounts },
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
