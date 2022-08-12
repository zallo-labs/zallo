import { gql } from '@apollo/client';
import { useTxsMetadataQuery } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { getTxIdParts, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { TxMetadata } from '.';
import { useAccountIds } from '../account/useAccountIds';

gql`
  query TxsMetadata($accounts: [String!]!) {
    txes(where: { account_in: $accounts }) {
      id
      timestamp
    }
  }
`;

export const useSubTxsMetadata = () => {
  const accounts = useAccountIds();

  const { data, ...rest } = useTxsMetadataQuery({
    client: useSubgraphClient(),
    variables: { accounts },
  });

  const txs = useMemo(
    (): TxMetadata[] =>
      data?.txes.map((tx): TxMetadata => {
        const id = toId(tx.id);
        const { account, hash } = getTxIdParts(id);

        return {
          id,
          account,
          hash,
          timestamp: DateTime.fromISO(tx.timestamp),
        };
      }) ?? [],
    [data?.txes],
  );

  return { txs, ...rest };
};
