import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { GetApiTxs, GetApiTxsVariables } from '@gql/api.generated';
import { apiGql, subGql } from '@gql/clients';
import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useApiClient, useSubgraphClient } from '@gql/GqlProvider';
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
  type: TxType;
  hash: BytesLike;
  ops: Op[];
  approvals: Signer[];
  // comments: Comment[];
}

export interface ExecutedTx extends ProposedTx {
  id: Id;
  responses: BytesLike[];
  executor: Address;
  blockHash: BytesLike;
  timestamp: DateTime;
  transfers: Transfer[];
}

export type Tx = ProposedTx | ExecutedTx;

export const isExecutedTx = (tx: Tx): tx is ExecutedTx => 'responses' in tx;
export const isProposedTx = (tx: Tx): tx is ProposedTx => !isExecutedTx(tx);

const useSubExecutedTxs = () => {
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
          ops: [],
          approvals: [],
        }),
      ) ?? [],
    [data],
  );

  return { executedTxs, ...rest };
};

export const API_TX_FIELDS = apiGql`
fragment TxFields on Tx {
  id
  safeId
  hash
  ops {
    hash
    to
    value
    data
    nonce
  }
  approvals {
    approverId
    signature
  }
}
`;

const API_QUERY = apiGql`
${API_TX_FIELDS}

query GetApiTxs($safe: Address!) {
  txs(safe: $safe) {
    ...TxFields
  }
}
`;

const useApiProposedTxs = () => {
  const { safe } = useSafe();

  const { data, ...rest } = useQuery<GetApiTxs, GetApiTxsVariables>(API_QUERY, {
    client: useApiClient(),
    variables: { safe: safe.address },
  });

  const proposedTxs: ProposedTx[] = useMemo(
    () =>
      data?.txs.map(
        (tx): ProposedTx => ({
          type: tx.ops.length === 1 ? TxType.SINGLE : TxType.MULTI,
          hash: tx.hash,
          ops: tx.ops.map((op) => ({
            ...op,
            to: address(op.to),
          })),
          approvals: tx.approvals.map((a) => ({
            addr: address(a.approverId),
            signature: a.signature,
          })),
        }),
      ) ?? [],
    [data],
  );

  return { proposedTxs, ...rest };
};

export const useTxs = () => {
  const { executedTxs: subExecutedTxs, ...subRest } = useSubExecutedTxs();
  const { proposedTxs, ...apiRest } = useApiProposedTxs();

  const rest = combineRest(subRest, apiRest);

  const txs: Tx[] = useMemo(
    () =>
      combine<ExecutedTx, ProposedTx, BytesLike, Tx>(
        subExecutedTxs,
        proposedTxs,
        simpleKeyExtractor('hash'),
        {
          requireBoth: (sub, api): ExecutedTx => ({
            ...sub,
            ...api,
          }),
          either: ({ sub, api }): Tx => sub ?? api,
        },
      ),
    [subExecutedTxs, proposedTxs],
  );

  return { txs, ...rest };
};
