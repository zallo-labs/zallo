import {
  TransactionProposalFieldsFragmentDoc,
  UpdateProposalInput,
  useUpdateProposalMutation,
} from '@api/generated';
import { gql } from '@apollo/client';
import { useCallback } from 'react';

gql`
  ${TransactionProposalFieldsFragmentDoc}

  mutation UpdateProposal($input: UpdateProposalInput!) {
    updateProposal(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export const useUpdateProposal = () => {
  const [mutation] = useUpdateProposalMutation();

  return useCallback(
    (input: UpdateProposalInput) => mutation({ variables: { input } }),
    [mutation],
  );
};
