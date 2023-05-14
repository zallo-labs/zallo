import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useMemo } from 'react';
import {
  RequestableTokensDocument,
  RequestableTokensQuery,
  RequestableTokensQueryVariables,
} from '@api/generated';
import { useSuspenseQuery, usePollWhenFocussed } from '~/gql/util';

gql`
  query RequestableTokens($input: RequestTokensInput!) {
    requestableTokens(input: $input)
  }
`;

export const useCanRequestTokens = (account: Address) => {
  const { data, ...rest } = useSuspenseQuery<
    RequestableTokensQuery,
    RequestableTokensQueryVariables
  >(RequestableTokensDocument, { variables: { input: { account } } });
  usePollWhenFocussed(rest, 5 * 60);

  return useMemo(() => data.requestableTokens.length > 0, [data]);
};
