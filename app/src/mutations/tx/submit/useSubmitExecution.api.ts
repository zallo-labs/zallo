import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
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

const MUTATION = gql`
  ${API_SUBMISSION_FIELDS}

  mutation SubmitTxExecution(
    $safe: Address!
    $txHash: Bytes32!
    $submission: SubmissionInput!
  ) {
    submitTxExecution(safe: $safe, txHash: $txHash, submission: $submission) {
      ...SubmissionFields
    }
  }
`;

export const useApiSubmitExecution = () => {
  const { safe } = useSafe();

  const [mutation] = useMutation<
    SubmitTxExecutionMutation,
    SubmitTxExecutionMutationVariables
  >(MUTATION, { client: useApiClient() });

  const submit = useCallback(
    async (tx: Tx, txResp: ContractTransaction) => {
      const r = await mutation({
        variables: {
          safe: safe.address,
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
            variables: { safe: safe.address },
          };
          const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
            queryOpts,
          ) ?? { txs: [] };

          const newTxs = [...data.txs];

          const i = newTxs.findIndex((t) => t.id === tx.id);
          if (i >= 0) {
            newTxs[i] = {
              ...newTxs[i],
              submissions: [...(newTxs[i].submissions ?? []), submission],
            };
          }

          cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
            ...queryOpts,
            overwrite: true,
            data: { txs: newTxs },
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
    [safe.address, mutation],
  );

  return submit;
};
