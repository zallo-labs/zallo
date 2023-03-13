import { gql } from '@apollo/client';
import { useCallback } from 'react';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  useRemoveProposalMutation,
} from '@api/generated';
import { updateQuery } from '~/gql/util';
import { ProposalId } from './types';

gql`
  mutation RemoveProposal($id: Bytes32!) {
    removeProposal(id: $id) {
      id
    }
  }
`;

export const useRemoveProposal = () => {
  const [remove] = useRemoveProposalMutation();

  return useCallback(
    (id: ProposalId) =>
      remove({
        variables: { id },
        optimisticResponse: {
          removeProposal: {
            __typename: 'Proposal',
            id,
          },
        },
        update: (cache, res) => {
          const proposal = res.data?.removeProposal;
          if (!proposal) return;

          // Remove proposal from ProposalsMetadataQuery; cache eviction is done as there are multiple variables that may include the proposal
          cache.evict({ id: cache.identify(proposal) });
          cache.gc();

          updateQuery<ProposalQuery, ProposalQueryVariables>({
            query: ProposalDocument,
            cache,
            variables: { id },
            updater: (data) => {
              data.proposal = null;
            },
          });
        },
      }),
    [remove],
  );
};
