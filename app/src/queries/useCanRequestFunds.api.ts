import { gql } from '@apollo/client';
import { Address } from 'lib';
import {
  CanRequestFundsDocument,
  CanRequestFundsQuery,
  CanRequestFundsQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

gql`
  query CanRequestFunds($recipient: Address!) {
    canRequestFunds(recipient: $recipient)
  }
`;

export const useCanRequestFunds = (recipient: Address) => {
  const { data, ...rest } = useSuspenseQuery<
    CanRequestFundsQuery,
    CanRequestFundsQueryVariables
  >(CanRequestFundsDocument, {
    client: useApiClient(),
    variables: { recipient },
  });
  usePollWhenFocussed(rest, 5 * 60);

  return [data.canRequestFunds, rest] as const;
};
