import { gql } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { useUserAccountsQuery } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { address, connectAccount, toId } from 'lib';
import { useMemo } from 'react';
import { QUERY_ACCOUNT_POLL_INTERVAL, CombinedAccount } from '.';

const QUERY = gql`
  query UserAccounts($user: ID!) {
    user(id: $user) {
      quorums(where: { active: true }) {
        wallet {
          account {
            id
            impl {
              id
            }
          }
        }
      }
    }
  }
`;

export const useSubUserAccounts = () => {
  const device = useDevice();

  const { data, ...rest } = useUserAccountsQuery({
    client: useSubgraphClient(),
    pollInterval: QUERY_ACCOUNT_POLL_INTERVAL,
  });

  const accounts = useMemo(
    (): CombinedAccount[] =>
      data?.user?.quorums.map(({ wallet: { account } }) => ({
        id: toId(account.id),
        contract: connectAccount(account.id, device),
        impl: address(account.impl.id),
        name: '',
      })) ?? [],
    [data?.user?.quorums, device],
  );

  return { data: accounts, ...rest };
};
