import { gql } from '@apollo/client';
import { useCallback } from 'react';
import { useRemoveProposalMutation } from '@api/generated';
import { ProposalId } from './types';

gql`
  mutation RemoveProposal($input: ProposalInput!) {
    removeProposal(input: $input)
  }
`;

export const useRemoveProposal = () => {
  const [remove] = useRemoveProposalMutation();

  return useCallback(
    (id: ProposalId) =>
      remove({
        variables: {
          input: { hash: id },
        },
        optimisticResponse: {
          removeProposal: id,
        },
        update: (cache, res) => {
          const id = res.data?.removeProposal;
          if (id) {
            cache.evict({ id });
            cache.gc();
          }
        },
      }),
    [remove],
  );
};
