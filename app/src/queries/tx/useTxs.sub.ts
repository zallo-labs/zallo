import { gql, useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useSubgraphClient } from '@gql/GqlProvider';
import { SubTxsQuery, SubTxsQueryVariables } from '@gql/generated.sub';
import { toId, address, ZERO_ADDR, ZERO } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { TRANSFER_FIELDS, fieldsToTransfer } from './transfer.sub';
import { QUERY_TXS_POLL_INTERVAL, ExecutedTx, TxStatus } from '.';

const SUB_QUERY = gql`
  ${TRANSFER_FIELDS}

  query SubTxs($safe: String!) {
    txes(where: { safe: $safe }) {
      id
      hash
      success
      response
      executor
      blockHash
      timestamp
      transfers {
        ...TransferFields
      }
    }
  }
`;

export const useSubExecutedTxs = () => {
  const { contract: safe } = useSafe();

  const { data, ...rest } = useQuery<SubTxsQuery, SubTxsQueryVariables>(
    SUB_QUERY,
    {
      client: useSubgraphClient(),
      variables: { safe: toId(safe.address) },
      pollInterval: QUERY_TXS_POLL_INTERVAL,
    },
  );

  const executedTxs: ExecutedTx[] = useMemo(
    () =>
      data?.txes.map((t): ExecutedTx => {
        const timestamp = DateTime.fromSeconds(parseInt(t.timestamp));

        return {
          id: toId(t.id),
          hash: t.hash,
          response: t.response,
          executor: address(t.executor),
          blockHash: t.blockHash,
          proposedAt: timestamp,
          executedAt: timestamp,
          timestamp,
          transfers: t.transfers.map(fieldsToTransfer),
          to: ZERO_ADDR,
          value: ZERO,
          data: [],
          salt: undefined as any,
          approvals: [],
          userHasApproved: false,
          submissions: [],
          status: TxStatus.Executed,
        };
      }) ?? [],
    [data],
  );

  return { executedTxs, ...rest };
};
