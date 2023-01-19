import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useCallback } from 'react';
import { useRequestApprovalMutation } from '~/gql/generated.api';
import { ProposalId } from '~/queries/proposal';

gql`
  mutation RequestApproval($id: Bytes32!, $approvers: [Address!]!) {
    requestApproval(id: $id, approvers: $approvers)
  }
`;

export const useRequestApproval = () => {
  const [mutate] = useRequestApprovalMutation();

  return useCallback(
    (proposal: ProposalId, approvers: Set<Address>) =>
      mutate({
        variables: {
          id: proposal.id,
          approvers: [...approvers],
        },
      }),
    [mutate],
  );
};
