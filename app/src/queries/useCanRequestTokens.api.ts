import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useMemo } from 'react';
import {
  RequestableTokensDocument,
  RequestableTokensQuery,
  RequestableTokensQueryVariables,
} from '~/gql/generated.api';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

gql`
  query RequestableTokens($recipient: Address!) {
    requestableTokens(recipient: $recipient)
  }
`;

export const useCanRequestTokens = (recipient: Address) => {
  const { data, ...rest } = useSuspenseQuery<
    RequestableTokensQuery,
    RequestableTokensQueryVariables
  >(RequestableTokensDocument, { variables: { recipient } });
  usePollWhenFocussed(rest, 5 * 60);

  return useMemo(() => data.requestableTokens.length > 0, [data]);
};
