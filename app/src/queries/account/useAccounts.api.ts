import { gql } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { useUserAccountsQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { address, connectAccount, toId } from 'lib';
import { useMemo } from 'react';
import { ACCOUNT_IMPL } from '~/provider';
import { CombinedAccount, QUERY_ACCOUNT_POLL_INTERVAL } from '.';

export const API_ACCOUNT_FIELDS = gql`
  fragment AccountFields on Account {
    id
    name
    impl
    deploySalt
  }
`;

export const API_USER_ACCOUNTS_QUERY = gql`
  ${API_ACCOUNT_FIELDS}

  query UserAccounts {
    userAccounts {
      ...AccountFields
    }
  }
`;

export const useApiUserAccounts = () => {
  const device = useDevice();

  const { data, ...rest } = useUserAccountsQuery({
    client: useApiClient(),
    pollInterval: QUERY_ACCOUNT_POLL_INTERVAL,
  });

  const accounts = useMemo(
    (): CombinedAccount[] =>
      data?.userAccounts.map((account) => ({
        id: toId(account.id),
        contract: connectAccount(account.id, device),
        impl: account.impl ? address(account.impl) : ACCOUNT_IMPL,
        deploySalt: account.deploySalt || undefined,
        name: account.name,
      })) ?? [],
    [data?.userAccounts, device],
  );

  return { data: accounts, ...rest };
};
