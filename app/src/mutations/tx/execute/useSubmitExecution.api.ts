import { gql } from '@apollo/client';
import {
  TxQuery,
  TxQueryVariables,
  useSubmitTxExecutionMutation,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { ContractTransaction, ethers } from 'ethers';
import { useCallback } from 'react';
import { toId } from 'lib';
import { DateTime } from 'luxon';
import { Tx } from '~/queries/tx';
import produce from 'immer';
import { QueryOpts } from '@gql/update';
import { API_QUERY_TX } from '~/queries/tx/useTx.api';

gql`
  mutation SubmitTxExecution(
    $account: Address!
    $txHash: Bytes32!
    $submission: SubmissionInput!
  ) {
    submitTxExecution(
      account: $account
      txHash: $txHash
      submission: $submission
    ) {
      id
      hash
      nonce
      gasLimit
      gasPrice
      finalized
      createdAt
    }
  }
`;

export const useApiSubmitExecution = () => {
  const [mutation] = useSubmitTxExecutionMutation({ client: useApiClient() });

  const submit = useCallback(
    async (tx: Tx, txResp: ContractTransaction) => {
      const r = await mutation({
        variables: {
          account: tx.account,
          txHash: ethers.utils.hexlify(tx.hash),
          submission: {
            hash: txResp.hash,
          },
        },
        update: (cache, res) => {
          const submission = res.data?.submitTxExecution;
          if (!submission) return;

          // Tx
          const opts: QueryOpts<TxQueryVariables> = {
            query: API_QUERY_TX,
            variables: {
              account: tx.account,
              hash: tx.hash,
            },
          };

          const data: TxQuery = cache.readQuery<TxQuery>(opts) ?? { tx: null };

          cache.writeQuery<TxQuery>({
            ...opts,
            data: produce(data, (data) => {
              data.tx?.submissions?.push(submission);
            }),
          });
        },
        optimisticResponse: {
          submitTxExecution: {
            __typename: 'Submission',
            id: toId(txResp.hash),
            hash: txResp.hash,
            nonce: txResp.nonce,
            gasLimit: txResp.gasLimit.toString(),
            gasPrice: txResp.gasPrice?.toString(),
            finalized: txResp.confirmations > 0,
            createdAt: DateTime.now().toISO(),
          },
        },
      });

      return r;
    },
    [mutation],
  );

  return submit;
};
