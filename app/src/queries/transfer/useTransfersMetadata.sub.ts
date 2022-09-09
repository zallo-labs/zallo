import { gql } from '@apollo/client';
import { toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { TransferType, useTransfersMetadataQuery } from '~/gql/generated.sub';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { TransferMetadata } from '.';
import { useAccountIds } from '../account/useAccountIds';

gql`
  query TransfersMetadata($accounts: [String!]!, $types: [TransferType!]!) {
    transfers(where: { account_in: $accounts, type_in: $types }) {
      id
      timestamp
    }
  }
`;

export const useTransfersMetadata = (...types: TransferType[]) => {
  const accounts = useAccountIds();

  const { data, ...rest } = useTransfersMetadataQuery({
    client: useSubgraphClient(),
    variables: {
      accounts: accounts.map(toId),
      types,
    },
  });

  const transfers = useMemo(
    (): TransferMetadata[] =>
      data?.transfers.map(
        (t): TransferMetadata => ({
          id: toId(t.id),
          timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
        }),
      ) ?? [],
    [data?.transfers],
  );

  return { transfers, ...rest };
};
