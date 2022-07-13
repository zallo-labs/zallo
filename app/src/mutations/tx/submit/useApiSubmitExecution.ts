import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  GetApiTxs,
  GetApiTxsVariables,
  SubmitTxExecution,
  SubmitTxExecutionVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import {
  API_GET_TXS_QUERY,
  API_SUBMISSION_FIELDS,
  Tx,
} from '~/queries/tx/useTxs';
import { ContractTransaction, ethers } from 'ethers';
import { useCallback } from 'react';
import { toId } from 'lib';
import { DateTime } from 'luxon';

const MUTATION = apiGql`
${API_SUBMISSION_FIELDS}

mutation SubmitTxExecution($safe: Address! $txHash: Bytes32!, $submission: SubmissionInput!) {
  submitTxExecution(safe: $safe, txHash: $txHash, submission: $submission) {
    ...SubmissionFields
  }
}
`;

export const useApiSubmitExecution = () => {
  const { safe } = useSafe();

  const [mutation] = useMutation<SubmitTxExecution, SubmitTxExecutionVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const submit = useCallback(
    async (tx: Tx, txResp: ContractTransaction) => {
      console.log('Submitting execution');

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
          const data = cache.readQuery<GetApiTxs, GetApiTxsVariables>(
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

          cache.writeQuery<GetApiTxs, GetApiTxsVariables>({
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
