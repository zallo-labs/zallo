import { useCallback } from 'react';
import { logError } from '~/util/analytics';
import { gql } from '@api/gen';
import { ProposeInput } from '@api/gen/graphql';
import { useMutation } from 'urql';

const Propose = gql(/* GraphQL */ `
  mutation UsePropose($input: ProposeInput!) {
    propose(input: $input) {
      id
      hash
    }
  }
`);

export const usePropose = () => {
  const propose = useMutation(Propose)[1];

  return useCallback(
    async (input: ProposeInput) => {
      const r = await propose({ input });

      const hash = r.data?.propose.hash;
      if (!hash) logError('Proposal failed', { input, error: r.error });

      return hash!;
    },
    [propose],
  );
};
