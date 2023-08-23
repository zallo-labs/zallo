import { useCallback } from 'react';
import { logError } from '~/util/analytics';
import { gql } from '@api/generated';
import { ProposeTransactionInput } from '@api/generated/graphql';
import { useMutation } from 'urql';

const Propose = gql(/* GraphQL */ `
  mutation UsePropose($input: ProposeTransactionInput!) {
    proposeTransaction(input: $input) {
      id
      hash
    }
  }
`);

export const usePropose = () => {
  const propose = useMutation(Propose)[1];

  return useCallback(
    async (input: ProposeTransactionInput) => {
      const r = await propose({ input });

      const hash = r.data?.proposeTransaction.hash;
      if (!hash) logError('Proposal failed', { input, error: r.error });

      return hash!;
    },
    [propose],
  );
};
