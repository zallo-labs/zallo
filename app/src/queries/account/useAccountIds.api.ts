import { gql } from '@apollo/client';
import { address, Address } from 'lib';
import { useMemo } from 'react';
import {
  AccountIdsDocument,
  AccountIdsQuery,
  AccountIdsQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
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
  const { data, ...rest } = useSuspenseQuery<
    AccountIdsQuery,
    AccountIdsQueryVariables
  >(AccountIdsDocument, {
    client: useApiClient(),
    variables: {},
  });
  usePollWhenFocussed(rest, 30);

  const ids = useMemo(
    (): Address[] => data.accounts.map((a) => address(a.id)),
    [data.accounts],
  );

  return [ids, rest] as const;
};
