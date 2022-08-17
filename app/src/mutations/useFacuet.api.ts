import { gql } from '@apollo/client';
import { useRequestFundsMutation } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Address } from 'lib';
import { useCallback } from 'react';
import { CHAIN } from '~/provider';

gql`
  mutation RequestFunds($recipient: Address!) {
    requestFunds(recipient: $recipient)
  }
`;

export const useFaucet = () => {
  const [mutation] = useRequestFundsMutation({ client: useApiClient() });

  return useCallback(
    async (recipient: Address) => {
      if (CHAIN.isTestnet) {
        await mutation({
          variables: { recipient },
        });
      }
    },
    [mutation],
  );
};
