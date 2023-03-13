import { gql } from '@apollo/client';
import { showInfo } from '~/provider/SnackbarProvider';
import {
  RequestableTokensDocument,
  RequestableTokensQuery,
  RequestableTokensQueryVariables,
  useRequestTokensMutation,
} from '@api/generated';
import { Address } from 'lib';
import { useCallback } from 'react';
import { CHAIN } from '~/util/network/provider';
import { useCanRequestTokens } from '~/gql/api/faucet/useCanRequestTokens';

gql`
  mutation RequestTokens($recipient: Address!) {
    requestTokens(recipient: $recipient)
  }
`;

export const useFaucet = (recipient: Address) => {
  const [mutation] = useRequestTokensMutation({
    variables: { recipient },
    update: (cache, { data }) => {
      if (!data) return;

      cache.writeQuery<RequestableTokensQuery, RequestableTokensQueryVariables>({
        query: RequestableTokensDocument,
        variables: { recipient },
        data: {
          requestableTokens: [],
        },
      });
    },
  });
  const canRequest = useCanRequestTokens(recipient);

  const receive = useCallback(async () => {
    showInfo('Requesting testnet tokens...', { autoHide: false });

    await mutation();

    showInfo('Tesetnet tokens received');
  }, [mutation]);

  return CHAIN.isTestnet && canRequest ? receive : undefined;
};
