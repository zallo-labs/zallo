import { gql } from '@apollo/client';
import {
  RequestableTokensDocument,
  RequestableTokensQuery,
  RequestableTokensQueryVariables,
  useRequestTokensMutation,
} from '@api/generated';
import { Address } from 'lib';
import { CHAIN } from '~/util/network/provider';
import { useCanRequestTokens } from './useCanRequestTokens';

gql`
  mutation RequestTokens($input: RequestTokensInput!) {
    requestTokens(input: $input)
  }
`;

export const useFaucet = (recepient: Address) => {
  const [mutation] = useRequestTokensMutation({
    variables: { input: { account: recepient } },
    update: (cache, { data }) => {
      if (!data) return;

      cache.writeQuery<RequestableTokensQuery, RequestableTokensQueryVariables>({
        query: RequestableTokensDocument,
        variables: { input: { account: recepient } },
        data: {
          requestableTokens: [],
        },
      });
    },
  });
  const canRequest = useCanRequestTokens(recepient);

  return CHAIN.testnet && canRequest ? mutation : undefined;
};
