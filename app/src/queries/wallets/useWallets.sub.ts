import { gql, useQuery } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { useSubgraphClient } from '@gql/GqlProvider';
import { address, toWalletRef, toId, toQuorum } from 'lib';
import { CombinedWallet, CombinedQuorum, QUERY_WALLETS_POLL_INTERVAL } from '.';
import { useMemo } from 'react';
import {
  UserWalletsQuery,
  UserWalletsQueryVariables,
} from '@gql/generated.sub';

const QUERY = gql`
  query UserWallets($user: ID!) {
    user(id: $user) {
      quorums(where: { active: true }) {
        wallet {
          id
          ref
          account {
            id
          }
          quorums(where: { active: true }) {
            id
            hash
            approvers {
              id
            }
            timestamp
          }
        }
      }
    }
  }
`;

export const useSubUserWallets = () => {
  const device = useDevice();

  const { data, ...rest } = useQuery<
    UserWalletsQuery,
    UserWalletsQueryVariables
  >(QUERY, {
    client: useSubgraphClient(),
    variables: { user: toId(device.address) },
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
  });

  const wallets = useMemo(
    (): CombinedWallet[] =>
      data?.user?.quorums.map(({ wallet }) => ({
        id: toId(wallet.id),
        accountAddr: address(wallet.account.id),
        ref: toWalletRef(wallet.ref),
        name: '',
        quorums: wallet.quorums.map(
          (quorum): CombinedQuorum => ({
            approvers: toQuorum(quorum.approvers.map((a) => address(a.id))),
            active: true,
          }),
        ),
      })) ?? [],
    [data?.user?.quorums],
  );

  return { data: wallets, ...rest };
};
