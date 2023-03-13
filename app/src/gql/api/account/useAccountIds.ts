import { gql } from '@apollo/client';
import { asAddress } from 'lib';
import { useMemo } from 'react';
import { AccountIdsDocument, AccountIdsQuery, AccountIdsQueryVariables } from '@api/generated';
import { useSuspenseQuery } from '~/gql/util';
import { AccountId } from './types';

gql`
  query AccountIds {
    accounts {
      id
    }
  }
`;

export const useAccountIds = () => {
  const { data } = useSuspenseQuery<AccountIdsQuery, AccountIdsQueryVariables>(AccountIdsDocument, {
    variables: {},
  });

  return useMemo(
    (): AccountId[] => data.accounts.map((a): AccountId => asAddress(a.id) as AccountId),
    [data.accounts],
  );
};
