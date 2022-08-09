import { gql, useMutation } from '@apollo/client';
import {
  ApiTxsQuery,
  ApiTxsQueryVariables,
  SubmitTxExecutionMutation,
  SubmitTxExecutionMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { ContractTransaction, ethers } from 'ethers';
import { useCallback } from 'react';
import { toId } from 'lib';
import { DateTime } from 'luxon';
import {
  API_SUBMISSION_FIELDS,
  API_GET_TXS_QUERY,
} from '~/queries/tx/useTxs.api';
import { Tx } from '~/queries/tx';
import produce from 'immer';
import assert from 'assert';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';

const MUTATION = gql`
  ${API_SUBMISSION_FIELDS}

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
      ...SubmissionFields
    }
  }
`;

export const useApiSubmitExecution = () => {
  const { accountAddr } = useSelectedWallet();

  const [mutation] = useMutation<
    SubmitTxExecutionMutation,
    SubmitTxExecutionMutationVariables
  >(MUTATION, { client: useApiClient() });

  const submit = useCallback(
    async (tx: Tx, txResp: ContractTransaction) => {
      const r = await mutation({
        variables: {
          account: accountAddr,
          txHash: ethers.utils.hexlify(tx.hash),
          submission: {
            hash: txResp.hash,
          },
        },
        update: (cache, res) => {
          const submission = res?.data?.submitTxExecution;
          if (!submission) return;

          const queryOpts = {
            query: API_GET_TXS_QUERY,
            variables: { account: accountAddr },
          };
          const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
            queryOpts,
          ) ?? { txs: [] };

          cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
            ...queryOpts,
            overwrite: true,
            // data: { txs: newTxs },
            data: produce(data, (data) => {
              const i = data.txs.findIndex((t) => t.id === tx.id);
              assert(i >= 0, 'Tx exists for submission');

              data.txs[i].submissions = [
                ...(data.txs[i].submissions ?? []),
                submission,
              ];
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
    [accountAddr, mutation],
  );

  return submit;
};
