import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useCanRequestFundsQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';

gql`
  query CanRequestFunds($recipient: Address!) {
    canRequestFunds(recipient: $recipient)
  }
`;

export const useCanRequestFunds = (recipient?: Address) => {
  const { data } = useCanRequestFundsQuery({
    client: useApiClient(),
    variables: { recipient },
    skip: !recipient,
    pollInterval: 5 * 60 * 1000,
  });

  return !!data?.canRequestFunds;
};
