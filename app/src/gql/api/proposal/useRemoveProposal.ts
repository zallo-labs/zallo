import { useCallback } from 'react';
import { useRemoveProposalMutation } from '@api/generated';
import { gql } from '@api/gen';
import { Hex } from 'lib';

gql(/* GraphQL */ `
  mutation RemoveProposal($input: ProposalInput!) {
    removeProposal(input: $input)
  }
`);

export const useRemoveProposal = () => {
  const [remove] = useRemoveProposalMutation();

  return useCallback(
    (p: { id: string; hash: Hex }) =>
      remove({
        variables: { input: { hash: p.hash } },
        optimisticResponse: { removeProposal: p.id },
        update: (cache, res) => {
          const id = res.data?.removeProposal;
          if (!id) return;

          cache.evict({ id });
          cache.gc();
        },
      }),
    [remove],
  );
};
