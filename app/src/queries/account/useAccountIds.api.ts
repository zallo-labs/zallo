import { gql } from '@apollo/client';
import { address } from 'lib';
import { useMemo } from 'react';
import { AccountIdsDocument, AccountIdsQuery, AccountIdsQueryVariables } from '~/gql/generated.api';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

gql`
  query AccountIds {
    accounts {
      id
    }
  }
`;

export const useAccountIds = () => {
  const { data, ...rest } = useSuspenseQuery<AccountIdsQuery, AccountIdsQueryVariables>(
    AccountIdsDocument,
  );
  usePollWhenFocussed(rest, 60);

  return useMemo(() => data.accounts.map((a) => address(a.id)), [data]);
};
