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
import { useCanRequestTokens } from './useCanRequestTokens';

gql`
  mutation RequestTokens($input: RequestTokensInput!) {
    requestTokens(input: $input)
  }
`;

export const useFaucet = (account: Address) => {
  const [mutation] = useRequestTokensMutation({
    variables: { input: { account } },
    update: (cache, { data }) => {
      if (!data) return;

      cache.writeQuery<RequestableTokensQuery, RequestableTokensQueryVariables>({
        query: RequestableTokensDocument,
        variables: { input: { account } },
        data: {
          requestableTokens: [],
        },
      });
    },
  });
  const canRequest = useCanRequestTokens(account);

  const receive = useCallback(async () => {
    showInfo('Requesting testnet tokens...', { autoHide: false });

    await mutation();

    showInfo('Tesetnet tokens received');
  }, [mutation]);

  return CHAIN.isTestnet && canRequest ? receive : undefined;
};
