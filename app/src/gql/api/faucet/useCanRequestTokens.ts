import { gql, useSuspenseQuery } from '@apollo/client';
import { Address } from 'lib';
import { useMemo } from 'react';
import {
  RequestableTokensDocument,
  RequestableTokensQuery,
  RequestableTokensQueryVariables,
} from '@api/generated';

gql`
  query RequestableTokens($input: RequestTokensInput!) {
    requestableTokens(input: $input)
  }
`;

export const useCanRequestTokens = (account: Address) => {
  const { data } = useSuspenseQuery<RequestableTokensQuery, RequestableTokensQueryVariables>(
    RequestableTokensDocument,
    { variables: { input: { account } } },
  );

  return useMemo(() => data.requestableTokens.length > 0, [data]);
};
