import { gql } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { useUserSafesQuery } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { address, connectSafe, toId } from 'lib';
import { useMemo } from 'react';
import { QUERY_SAFE_POLL_INTERVAL, CombinedSafe } from '.';

const QUERY = gql`
  query UserSafes($user: ID!) {
    user(id: $user) {
      quorums(where: { active: true }) {
        account {
          safe {
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

export const useSubUserSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useUserSafesQuery({
    client: useSubgraphClient(),
    pollInterval: QUERY_SAFE_POLL_INTERVAL,
  });

  const safes = useMemo(
    (): CombinedSafe[] =>
      data?.user?.quorums.map(({ account: { safe } }) => ({
        id: toId(safe.id),
        contract: connectSafe(safe.id, wallet),
        impl: address(safe.impl.id),
        name: '',
      })) ?? [],
    [data?.user?.quorums, wallet],
  );

  return { data: safes, ...rest };
};
