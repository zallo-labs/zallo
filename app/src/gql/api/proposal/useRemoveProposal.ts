import { gql } from '@apollo/client';
import { useCallback } from 'react';
import {
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  useRemoveProposalMutation,
} from '@api/generated';
import { Proposal } from './types';
import { updateQuery } from '~/gql/util';

gql`
  mutation RemoveProposal($input: ProposalInput!) {
    removeProposal(input: $input)
  }
`;

export const useRemoveProposal = () => {
  const [remove] = useRemoveProposalMutation();

  return useCallback(
    (p: Proposal) =>
      remove({
        variables: { input: { hash: p.hash } },
        optimisticResponse: { removeProposal: p.id },
        update: (cache, res) => {
          const id = res.data?.removeProposal;
          if (!id) return;

          cache.evict({ id });
          cache.gc();

          updateQuery<ProposalsQuery, ProposalsQueryVariables>({
            query: ProposalsDocument,
            variables: { input: { accounts: [p.account] } },
            cache,
            defaultData: { proposals: [] },
            updater: (data) => {
              data.proposals = data.proposals.filter((p) => p.id !== id);
            },
          });
        },
      }),
    [remove],
  );
};
