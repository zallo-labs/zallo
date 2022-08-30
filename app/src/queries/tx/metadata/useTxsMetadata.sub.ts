import { gql } from '@apollo/client';
import { useTxsMetadataQuery } from '~/gql/generated.sub';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { getTxIdParts, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { QUERY_TXS_METADATA_POLL_INTERVAL, TxMetadata } from '..';
import { useAccountIds } from '~/queries/account/useAccountIds';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';

gql`
  query TxsMetadata($accounts: [String!]!) {
    txes(where: { account_in: $accounts }) {
      id
      hash
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
  usePollWhenFocussed(rest, QUERY_TXS_METADATA_POLL_INTERVAL);

  const txs = useMemo(
    (): TxMetadata[] =>
      data?.txes.map((tx): TxMetadata => {
        const id = toId(tx.id);
        const { account } = getTxIdParts(id);

        return {
          id: toId(`${account}-${tx.hash}`),
          account,
          hash: tx.hash,
          timestamp: DateTime.fromSeconds(parseInt(tx.timestamp)),
        };
      }) ?? [],
    [data?.txes],
  );

  return { txs, ...rest };
};
