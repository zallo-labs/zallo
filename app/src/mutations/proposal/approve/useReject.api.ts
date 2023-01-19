import { gql } from '@apollo/client';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  useRejectMutation,
} from '~/gql/generated.api';
import { useCallback } from 'react';
import { Proposal } from '~/queries/proposal';
import { updateQuery } from '~/gql/update';
import { useUser } from '~/queries/useUser.api';

gql`
  mutation Reject($id: Bytes32!) {
    reject(id: $id) {
      id
    }
  }
`;

export const useReject = () => {
  const user = useUser();
  const [mutation] = useRejectMutation();

  const reject = useCallback(
    async ({ id }: Proposal) =>
      mutation({
        variables: { id },
        optimisticResponse: {
          reject: { id },
        },
        update: async (cache, res) => {
          if (!res.data?.reject) return;

          // Remove approval from proposal
          updateQuery<ProposalQuery, ProposalQueryVariables>({
            cache,
            query: ProposalDocument,
            variables: { id },
            updater: (data) => {
              data.proposal!.approvals = data.proposal!.approvals?.filter(
                (a) => a.userId !== user.id,
              );
            },
          });
        },
      }),
    [mutation, user.id],
  );

  return reject;
};
