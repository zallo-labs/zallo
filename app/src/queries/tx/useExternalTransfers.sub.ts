import { gql, useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useSubgraphClient } from '@gql/GqlProvider';
import { TransfersQuery, TransfersQueryVariables } from '@gql/generated.sub';
import { toId } from 'lib';
import { useMemo } from 'react';
import { fieldsToTransfer, TRANSFER_FIELDS } from './transfer.sub';
import { QUERY_TXS_POLL_INTERVAL } from '.';
import { useTxs } from './useTxs';

const QUERY = gql`
  ${TRANSFER_FIELDS}

  query Transfers($safe: String!, $txs: [String!]!) {
    transfers(where: { safe: $safe, tx_not_in: $txs }) {
      ...TransferFields
    }
  }
`;

// Transfers not included in a tx
export const useExternalTransfers = () => {
  const { safe } = useSafe();
  const { txs } = useTxs();

  const { data, ...rest } = useQuery<TransfersQuery, TransfersQueryVariables>(
    QUERY,
    {
      client: useSubgraphClient(),
      variables: {
        safe: toId(safe.address),
        // Subgraph returns nothing when *_not_in is empty, so use a dummy value
        txs: txs.length ? txs.map((tx) => tx.id) : ['dummy'],
      },
      pollInterval: QUERY_TXS_POLL_INTERVAL,
    },
  );

  const transfers = useMemo(
    () => data?.transfers.map(fieldsToTransfer) ?? [],
    [data],
  );

  return { transfers, ...rest };
};
