import { useCallback } from 'react';
import { gql } from '@api/generated';
import { ProposeTransactionInput } from '@api/generated/graphql';
import { useMutation } from 'urql';
import { showError } from '#/provider/SnackbarProvider';

const Propose = gql(/* GraphQL */ `
  mutation UsePropose($input: ProposeTransactionInput!) {
    proposeTransaction(input: $input) {
      id
      hash
    }
  }
`);

export function usePropose() {
  const propose = useMutation(Propose)[1];

  return useCallback(
    async (input: ProposeTransactionInput) => {
      const r = await propose({ input });

      const id = r.data?.proposeTransaction.id;
      if (!id) showError('Something went wrong proposing transaction', { event: { input, ...r } });

      return id;
    },
    [propose],
  );
}
