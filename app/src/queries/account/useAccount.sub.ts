import { gql, useQuery } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { AccountQuery, AccountQueryVariables } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { Address, address, connectAccount, toId } from 'lib';
import { useMemo } from 'react';
import { QUERY_ACCOUNT_POLL_INTERVAL, CombinedAccount } from '.';

const QUERY = gql`
  query Account($account: ID!) {
    account(id: $account) {
      impl {
        id
      }
    }
  }
`;

export const useSubAccount = (accountAddr: Address) => {
  const device = useDevice();

  const { data, ...rest } = useQuery<AccountQuery, AccountQueryVariables>(
    QUERY,
    {
      client: useSubgraphClient(),
      variables: { account: toId(accountAddr) },
      pollInterval: QUERY_ACCOUNT_POLL_INTERVAL,
    },
  );

  const account = useMemo(
    (): CombinedAccount | undefined =>
      data?.account
        ? {
            id: toId(accountAddr),
            contract: connectAccount(accountAddr, device),
            impl: address(data.account.impl.id),
            name: '',
          }
        : undefined,
    [data?.account, accountAddr, device],
  );

  return { data: account, ...rest };
};
