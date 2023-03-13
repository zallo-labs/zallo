import { gql } from '@apollo/client';
import { Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  TransfersMetadataDocument,
  TransfersMetadataQuery,
  TransfersMetadataQueryVariables,
  TransferType,
} from '@subgraph/generated';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { useSuspenseQuery, usePollWhenFocussed } from '~/gql/util';
import { useAccountIds } from '@api/account';

gql`
  query TransfersMetadata($accounts: [String!]!, $types: [TransferType!]!) {
    transfers(where: { account_in: $accounts, type_in: $types }) {
      id
      timestamp
    }
  }
`;

export interface TransferMetadata {
  id: Id;
  timestamp: DateTime;
}

export const useTransfersMetadata = (...types: TransferType[]) => {
  const accounts = useAccountIds();

  const { data, ...rest } = useSuspenseQuery<
    TransfersMetadataQuery,
    TransfersMetadataQueryVariables
  >(TransfersMetadataDocument, {
    client: useSubgraphClient(),
    variables: {
      accounts: accounts.map(toId),
      types,
    },
  });
  usePollWhenFocussed(rest, 10);

  return useMemo(
    (): TransferMetadata[] =>
      data.transfers.map(
        (t): TransferMetadata => ({
          id: toId(t.id),
          timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
        }),
      ),
    [data.transfers],
  );
};
