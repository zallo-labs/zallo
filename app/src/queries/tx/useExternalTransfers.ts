import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { subGql } from '@gql/clients';
import { useSubgraphClient } from '@gql/GqlProvider';
import { GetTransfers, GetTransfersVariables } from '@gql/subgraph.generated';
import { toId } from 'lib';
import { useMemo } from 'react';
import { fieldsToTransfer, TRANSFER_FIELDS } from './transfer';
import { QUERY_TXS_POLL_INTERVAL, useTxs } from './useTxs';

const SUB_QUERY = subGql`
${TRANSFER_FIELDS}

query GetTransfers($safe: String!, $txs: [String!]!) {
  transfers(where: { safe: $safe, tx_not_in: $txs }) {
    ...TransferFields
  }
}
`;

// Transfers not included in a tx
export const useExternalTransfers = () => {
  const { safe } = useSafe();
  const { txs } = useTxs();

  const { data, ...rest } = useQuery<GetTransfers, GetTransfersVariables>(
    SUB_QUERY,
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
