import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useMemo } from 'react';
import { AccountIdsDocument, AccountIdsQuery, AccountIdsQueryVariables } from '@api/generated';
import { useSuspenseQuery } from '~/gql/util';

gql`
  query AccountIds {
    accounts {
      id
      address
    }
  }
`;

export const useAccountIds = () => {
  const { data } = useSuspenseQuery<AccountIdsQuery, AccountIdsQueryVariables>(AccountIdsDocument, {
    variables: {},
  });

  return useMemo((): Address[] => data.accounts.map((a) => a.address), [data.accounts]);
};
