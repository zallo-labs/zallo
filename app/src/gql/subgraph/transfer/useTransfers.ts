import { gql } from '@apollo/client';
import { toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  TransfersDocument,
  TransfersQuery,
  TransfersQueryVariables,
  TransferType,
} from '@subgraph/generated';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { useSuspenseQuery, usePollWhenFocussed } from '~/gql/util';
import { useAccountIds } from '@api/account';
import { TransferMetadata } from './types';

gql`
  query Transfers($accounts: [String!]!, $types: [TransferType!]!) {
    transfers(where: { account_in: $accounts, type_in: $types }) {
      id
      timestamp
    }
  }
`;

export const useTransfers = (...types: TransferType[]) => {
  const accounts = useAccountIds();

  const { data, ...rest } = useSuspenseQuery<TransfersQuery, TransfersQueryVariables>(
    TransfersDocument,
    {
      client: useSubgraphClient(),
      variables: {
        accounts: accounts.map(toId),
        types,
      },
    },
  );
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
