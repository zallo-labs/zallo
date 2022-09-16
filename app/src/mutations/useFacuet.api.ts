import { gql } from '@apollo/client';
import { showInfo } from '~/provider/ToastProvider';
import {
  CanRequestFundsDocument,
  CanRequestFundsQuery,
  CanRequestFundsQueryVariables,
  useRequestFundsMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Address } from 'lib';
import { useCallback } from 'react';
import { CHAIN } from '~/util/network/provider';
import { useCanRequestFunds } from '~/queries/useCanRequestFunds.api';

gql`
  mutation RequestFunds($recipient: Address!) {
    requestFunds(recipient: $recipient)
  }
`;

export const useFaucet = (recipient: Address, displayMessage?: boolean) => {
  const [mutation] = useRequestFundsMutation({
    client: useApiClient(),
    variables: { recipient },
    update: (cache, { data }) => {
      if (!data) return;

      cache.writeQuery<CanRequestFundsQuery, CanRequestFundsQueryVariables>({
        query: CanRequestFundsDocument,
        variables: { recipient },
        data: {
          canRequestFunds: !data.requestFunds,
        },
      });
    },
  });
  const [canRequestFunds] = useCanRequestFunds(recipient);

  const receive = useCallback(async () => {
    if (displayMessage)
      showInfo({
        text1: 'Requesting testnet funds...',
        autoHide: false,
      });

    await mutation();

    if (displayMessage) showInfo('Funds received');
  }, [displayMessage, mutation]);

  return CHAIN.isTestnet && canRequestFunds ? receive : undefined;
};
