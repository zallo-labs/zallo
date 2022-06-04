import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { subGql } from '@gql/clients';
import { useSubgraphClient } from '@gql/GqlProvider';
import { GetSubTxs, GetSubTxsVariables, TxType } from '@gql/subgraph.generated';
import { BytesLike } from 'ethers';
import { address, Address, Id, Op, Signer, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  fieldsToTransfer,
  Transfer,
  TRANSFER_FIELDS,
} from './useIndependentTransfers';

const SUB_QUERY = subGql`
${TRANSFER_FIELDS}

query GetSubTxs($safe: String!) {
  txes(where: { safe: $safe }) {
    id
    type
    hash
    responses
    executor
    blockHash
    timestamp
    transfers {
      ...TransferFields
    }
  }
}
`;

// export interface Comment {
//   id: Id;
//   author: Address;
//   content: string;
//   likes: Address[];
// }

export interface ProposedTx {
  id: Id;
  type: TxType;
  hash: BytesLike;
  //
  // ops: Op[];
  // approvals: Signer[];
  // comments: Comment[];
}

export interface ExecutedTx extends ProposedTx {
  responses: BytesLike[];
  executor: Address;
  blockHash: BytesLike;
  timestamp: DateTime;
  transfers: Transfer[];
}

export const useTxs = () => {
  const { safe } = useSafe();

  const { data, ...rest } = useQuery<GetSubTxs, GetSubTxsVariables>(SUB_QUERY, {
    client: useSubgraphClient(),
    variables: { safe: toId(safe.address) },
  });

  const executedTxs: ExecutedTx[] = useMemo(
    () =>
      data?.txes.map(
        (t): ExecutedTx => ({
          id: toId(t.id),
          type: t.type,
          hash: t.hash,
          responses: t.responses,
          executor: address(t.executor),
          blockHash: t.blockHash,
          timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
          transfers: t.transfers.map(fieldsToTransfer),
        }),
      ) ?? [],
    [data],
  );

  return { executedTxs, ...rest };
};
