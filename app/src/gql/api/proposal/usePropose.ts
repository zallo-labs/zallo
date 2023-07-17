import { useCallback } from 'react';
import { logError } from '~/util/analytics';
import { gql } from '@api/gen';
import { useUseProposeMutation } from '@api/generated';
import { ProposeInput } from '@api/gen/graphql';

gql(/* GraphQL */ `
  mutation UsePropose($input: ProposeInput!) {
    propose(input: $input) {
      id
      hash
    }
  }
`);

export const usePropose = () => {
  const [mutation] = useUseProposeMutation();

  return useCallback(
    async (input: ProposeInput) => {
      const r = await mutation({ variables: { input } });

      const hash = r.data?.propose.hash;
      if (!hash) logError('Proposal failed', { input, errors: r.errors });

      return hash!;
    },
    [mutation],
  );
};
