import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useMemo } from 'react';
import { AccountIdsDocument, AccountIdsQuery, AccountIdsQueryVariables } from '@api/generated';
import { useQuery } from '~/gql';

gql`
  query AccountIds {
    accounts {
      id
      address
    }
  }
`;

export const useAccountIds = () => {
  const { data } = useQuery<AccountIdsQuery, AccountIdsQueryVariables>(AccountIdsDocument);

  return useMemo((): Address[] => data.accounts.map((a) => a.address), [data.accounts]);
};
