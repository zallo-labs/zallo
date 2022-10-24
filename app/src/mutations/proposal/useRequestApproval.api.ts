import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useCallback } from 'react';
import { useRequestApprovalMutation } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { ProposalId } from '~/queries/proposal';

gql`
  mutation RequestApproval($approvers: NonEmptyAddressSet!, $hash: Bytes32!) {
    requestApproval(approvers: $approvers, hash: $hash)
  }
`;

export const useRequestApproval = () => {
  const [mutate] = useRequestApprovalMutation({
    client: useApiClient(),
  });

  return useCallback(
    (proposal: ProposalId, approvers: Set<Address>) =>
      mutate({
        variables: {
          hash: proposal.hash,
          approvers: [...approvers],
        },
      }),
    [mutate],
  );
};
