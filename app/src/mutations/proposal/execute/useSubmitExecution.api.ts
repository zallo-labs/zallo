import { gql } from '@apollo/client';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  useSubmitExecutionMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { ContractTransaction } from 'ethers';
import { useCallback } from 'react';
import { toId } from 'lib';
import { DateTime } from 'luxon';
import { Proposal } from '~/queries/proposal';
import produce from 'immer';
import { QueryOpts } from '~/gql/update';

gql`
  mutation SubmitExecution(
    $proposalHash: Bytes32!
    $submission: SubmissionInput!
  ) {
    submitExecution(proposalHash: $proposalHash, submission: $submission) {
      id
    }
  }
`;

export const useApiSubmitExecution = () => {
  const [mutation] = useSubmitExecutionMutation({ client: useApiClient() });

  return useCallback(
    async (p: Proposal, txResp: ContractTransaction) => {
      const r = await mutation({
        variables: {
          proposalHash: p.hash,
          submission: {
            hash: txResp.hash,
          },
        },
        optimisticResponse: {
          submitExecution: {
            id: toId(txResp.hash),
          },
        },
        update: (cache, res) => {
          const id = res.data?.submitExecution.id;
          if (!id) return;

          // Proposal: upsert submission
          const opts: QueryOpts<ProposalQueryVariables> = {
            query: ProposalDocument,
            variables: { hash: p.hash },
          };

          const data = cache.readQuery<ProposalQuery>(opts);
          if (!data) return;

          cache.writeQuery<ProposalQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              data.proposal.submissions = [
                ...(data.proposal.submissions ?? []).filter((s) => s.id !== id),
                {
                  id,
                  hash: txResp.hash,
                  nonce: txResp.nonce,
                  gasLimit: txResp.gasLimit.toString(),
                  gasPrice: txResp.gasPrice?.toString() || null,
                  createdAt: DateTime.now().toISO(),
                  response: null,
                },
              ];
            }),
          });
        },
      });

      return r;
    },
    [mutation],
  );
};
