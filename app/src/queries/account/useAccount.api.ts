import { gql, useQuery } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { AccountQuery, AccountQueryVariables } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Address, address, connectAccount, Id, toId } from 'lib';
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

export const API_ACCOUNT_QUERY = gql`
  ${API_ACCOUNT_FIELDS}

  query Account($id: Address!) {
    account(id: $id) {
      ...AccountFields
    }
  }
`;

export const useApiAccount = (accountAddr: Address) => {
  const device = useDevice();

  const { data, ...rest } = useQuery<AccountQuery, AccountQueryVariables>(
    API_ACCOUNT_QUERY,
    {
      client: useApiClient(),
      variables: { id: accountAddr },
      pollInterval: QUERY_ACCOUNT_POLL_INTERVAL,
    },
  );

  const account = useMemo(
    (): CombinedAccount | undefined =>
      data?.account
        ? {
            id: toId(accountAddr),
            contract: connectAccount(accountAddr, device),
            impl: data.account.impl ? address(data.account.impl) : ACCOUNT_IMPL,
            deploySalt: data.account.deploySalt || undefined,
            name: data.account.name,
          }
        : undefined,
    [data?.account, accountAddr, device],
  );

  return { data: account, ...rest };
};
