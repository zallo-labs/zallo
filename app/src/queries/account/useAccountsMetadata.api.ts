import { gql } from '@apollo/client';
import { useUserAccountsMetadataQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { address, toId } from 'lib';
import { useMemo } from 'react';
import { AccountMetadata, QUERY_ACCOUNT_POLL_INTERVAL } from '.';

export const API_USER_ACCOUNTS_METADATA_QUERY = gql`
  query UserAccountsMetadata {
    userAccounts {
      id
      name
    }
  }
`;

export const useApiUserAccountsMetadata = () => {
  const { data, ...rest } = useUserAccountsMetadataQuery({
    client: useApiClient(),
    pollInterval: QUERY_ACCOUNT_POLL_INTERVAL,
  });

  const apiAccountsMetadata = useMemo(
    (): AccountMetadata[] =>
      data?.userAccounts.map((acc) => ({
        id: toId(acc.id),
        addr: address(acc.id),
        name: acc.name,
      })) ?? [],
    [data?.userAccounts],
  );

  return { apiAccountsMetadata, ...rest };
};
