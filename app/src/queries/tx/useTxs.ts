import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { GetApiTxs, GetApiTxsVariables } from '@gql/api.generated';
import { apiGql, subGql } from '@gql/clients';
import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useApiClient, useSubgraphClient } from '@gql/GqlProvider';
import { GetSubTxs, GetSubTxsVariables, TxType } from '@gql/subgraph.generated';
import { BigNumber, BytesLike } from 'ethers';
import { address, Address, Id, Op, Signer, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { SUBMISSION_FIELDS } from '~/mutations/tx/submit/useApiSubmitExecution';
import { fieldsToTransfer, Transfer, TRANSFER_FIELDS } from './transfer';

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

export enum TxStatus {
  Proposed,
  Submitted,
  Executed,
}

export interface Approval extends Signer {
  timestamp: DateTime;
}

export interface Submission {
  hash: BytesLike;
  nonce: number;
  gasLimit: BigNumber;
  gasPrice?: BigNumber;
  finalized: boolean;
  createdAt: DateTime;
}

export interface ProposedTx {
  id: Id;
  type: TxType;
  hash: BytesLike;
  ops: OpWithHash[];
  approvals: Approval[];
  userHasApproved: boolean;
  submissions: Submission[];
  // comments: Comment[];
  proposedAt: DateTime;
  timestamp: DateTime;
  status: TxStatus;
}

export interface ExecutedTx extends ProposedTx {
  responses: BytesLike[];
  executor: Address;
  executedAt: DateTime;
  blockHash: BytesLike;
  transfers: Transfer[];
}

export type Tx = ProposedTx | ExecutedTx;

export const isTx = (e: unknown): e is Tx =>
  typeof e === 'object' && 'ops' in e;
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
      data?.txes.map((t): ExecutedTx => {
        const timestamp = DateTime.fromSeconds(parseInt(t.timestamp));

        return {
          id: toId(t.id),
          type: t.type,
          hash: t.hash,
          responses: t.responses,
          executor: address(t.executor),
          blockHash: t.blockHash,
          proposedAt: timestamp,
          executedAt: timestamp,
          timestamp,
          transfers: t.transfers.map(fieldsToTransfer),
          ops: [],
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

export const API_TX_FIELDS = apiGql`
${SUBMISSION_FIELDS}

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
    createdAt
  }
  createdAt
  submissions {
    ...SubmissionFields
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
  const wallet = useWallet();

  const { data, ...rest } = useQuery<GetApiTxs, GetApiTxsVariables>(API_QUERY, {
    client: useApiClient(),
    variables: { safe: safe.address },
  });

  const proposedTxs: ProposedTx[] = useMemo(
    () =>
      data?.txs.map((tx): ProposedTx => {
        const timestamp = DateTime.fromISO(tx.createdAt);

        const approvals: Approval[] = tx.approvals.map((a) => ({
          addr: address(a.approverId),
          signature: a.signature,
          timestamp: DateTime.fromISO(a.createdAt),
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
          userHasApproved: !!approvals.find(a => a.addr === wallet.address),
          submissions: tx.submissions.map((s) => ({
            hash: s.hash,
            nonce: s.nonce,
            gasLimit: BigNumber.from(s.gasLimit),
            gasPrice: s.gasPrice ? BigNumber.from(s.gasPrice) : undefined,
            finalized: s.finalized,
            createdAt: DateTime.fromISO(s.createdAt),
          })),
          proposedAt: timestamp,
          timestamp,
          status: tx.submissions.length
            ? TxStatus.Submitted
            : TxStatus.Proposed,
        };
      }) ?? [],
    [data, wallet.address],
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
          atLeastApi: (_, api) => api,
          // either: ({ sub, api }): Tx => sub ?? api,
        },
      ),
    [subExecutedTxs, proposedTxs],
  );

  return { txs, ...rest };
};
