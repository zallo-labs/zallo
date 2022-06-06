import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { GetApiTxs, GetApiTxsVariables } from '@gql/api.generated';
import { apiGql, subGql } from '@gql/clients';
import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useApiClient, useSubgraphClient } from '@gql/GqlProvider';
import { GetSubTxs, GetSubTxsVariables, TxType } from '@gql/subgraph.generated';
import { BigNumber, BytesLike } from 'ethers';
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

export interface OpWithHash extends Op {
  hash: BytesLike;
}

export type TxStatus = 'proposed' | 'executed'; // TODO: pending & reverted

export interface ProposedTx {
  id: Id;
  type: TxType;
  hash: BytesLike;
  ops: OpWithHash[];
  approvals: Signer[];
  // comments: Comment[];
  timestamp: DateTime;
  status: TxStatus;
}

export interface ExecutedTx extends ProposedTx {
  responses: BytesLike[];
  executor: Address;
  blockHash: BytesLike;
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
          status: 'executed',
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
  createdAt
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
      data?.txs.map((tx): ProposedTx => {
        const approvals: Signer[] = tx.approvals.map((a) => ({
          addr: address(a.approverId),
          signature: a.signature,
        }));

        return {
          id: toId(tx.id),
          type: tx.ops.length === 1 ? TxType.SINGLE : TxType.MULTI,
          hash: tx.hash,
          ops: tx.ops.map((op) => ({
            hash: op.hash,
            to: address(op.to),
            value: BigNumber.from(op.value),
            data: op.data,
            nonce: BigNumber.from(op.nonce),
          })),
          approvals,
          timestamp: DateTime.fromISO(tx.createdAt),
          status: 'proposed',
        };
      }) ?? [],
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
            id: sub.id,
            timestamp: sub.timestamp,
            status: sub.status,
          }),
          either: ({ sub, api }): Tx => sub ?? api,
        },
      ),
    [subExecutedTxs, proposedTxs],
  );

  return { txs, ...rest };
};
