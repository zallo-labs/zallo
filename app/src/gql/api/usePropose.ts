import { useCallback } from 'react';
import { useMutation } from 'urql';

import { gql } from '~/gql/api/generated';
import { ProposeTransactionInput } from '~/gql/api/generated/graphql';
import { logError } from '~/util/analytics';

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

      const id = r.data?.proposeTransaction.id;
      // TODO: handle failed proposal
      if (!id) logError('Proposal failed', { input, error: r.error });

      return id!;
    },
    [propose],
  );
};
