import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useCanRequestFundsQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';

gql`
  query CanRequestFunds($recipient: Address!) {
    canRequestFunds(recipient: $recipient)
  }
`;

export const useCanRequestFunds = (recipient?: Address) => {
  const { data, ...rest } = useCanRequestFundsQuery({
    client: useApiClient(),
    variables: { recipient },
    skip: !recipient,
  });
  usePollWhenFocussed(rest, 5 * 60 * 1000);

  return !!data?.canRequestFunds;
};
