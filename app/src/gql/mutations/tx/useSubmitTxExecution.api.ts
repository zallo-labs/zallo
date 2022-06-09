import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  SubmitTxExecution,
  SubmitTxExecutionVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { Tx } from '@gql/queries/useTxs';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { TransactionResponse } from 'zksync-web3/build/types';

export const SUBMISSION_FIELDS = apiGql`
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

const MUTATION = apiGql`
${SUBMISSION_FIELDS}

mutation SubmitTxExecution($safe: Address! $txHash: Bytes32!, $submission: SubmissionInput!) {
  submitTxExecution(safe: $safe, txHash: $txHash, submission: $submission) {
    ...SubmissionFields
  }
}
`;

export const useSubmitTxExecution = () => {
  const { safe } = useSafe();

  const [mutation] = useMutation<SubmitTxExecution, SubmitTxExecutionVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const submit = useCallback(
    (tx: Tx, txResp: TransactionResponse) =>
      mutation({
        variables: {
          safe: safe.address,
          txHash: ethers.utils.hexlify(tx.hash),
          submission: {
            hash: txResp.hash,
          },
        },
      }),
    [safe.address, mutation],
  );

  return submit;
};
