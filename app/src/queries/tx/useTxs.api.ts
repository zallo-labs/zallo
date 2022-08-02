import { gql, useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { ApiTxsQuery, ApiTxsQueryVariables } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { BigNumber } from 'ethers';
import { address, toId, toTxSalt } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { QUERY_TXS_POLL_INTERVAL, ProposedTx, Approval, TxStatus } from '.';

export const API_SUBMISSION_FIELDS = gql`
  fragment SubmissionFields on Submission {
    id
    hash
    nonce
    gasLimit
    gasPrice
    finalized
    createdAt
  }
`;

export const API_TX_FIELDS = gql`
  ${API_SUBMISSION_FIELDS}

  fragment TxFields on Tx {
    id
    safeId
    hash
    to
    value
    data
    salt
    approvals {
      userId
      signature
      createdAt
    }
    createdAt
    submissions {
      ...SubmissionFields
    }
  }
`;

export const API_GET_TXS_QUERY = gql`
  ${API_TX_FIELDS}

  query ApiTxs($safe: Address!) {
    txs(safe: $safe) {
      ...TxFields
    }
  }
`;

export const useApiProposedTxs = () => {
  const { contract: safe } = useSafe();
  const wallet = useWallet();

  const { data, ...rest } = useQuery<ApiTxsQuery, ApiTxsQueryVariables>(
    API_GET_TXS_QUERY,
    {
      client: useApiClient(),
      variables: { safe: safe.address },
      pollInterval: QUERY_TXS_POLL_INTERVAL,
    },
  );

  const proposedTxs: ProposedTx[] = useMemo(
    () =>
      data?.txs.map((tx): ProposedTx => {
        const timestamp = DateTime.fromISO(tx.createdAt);

        const approvals: Approval[] =
          tx.approvals?.map((a) => ({
            addr: address(a.userId),
            signature: a.signature,
            timestamp: DateTime.fromISO(a.createdAt),
          })) ?? [];

        return {
          id: toId(tx.id),
          hash: tx.hash,
          to: address(tx.to),
          value: BigNumber.from(tx.value),
          data: tx.data,
          salt: toTxSalt(tx.salt),
          approvals,
          userHasApproved: !!approvals.find((a) => a.addr === wallet.address),
          submissions:
            tx.submissions?.map((s) => ({
              hash: s.hash,
              nonce: s.nonce,
              gasLimit: BigNumber.from(s.gasLimit),
              gasPrice: s.gasPrice ? BigNumber.from(s.gasPrice) : undefined,
              finalized: s.finalized,
              createdAt: DateTime.fromISO(s.createdAt),
            })) ?? [],
          proposedAt: timestamp,
          timestamp,
          status: tx.submissions?.length
            ? TxStatus.Submitted
            : TxStatus.Proposed,
        };
      }) ?? [],
    [data, wallet.address],
  );

  return { proposedTxs, ...rest };
};
