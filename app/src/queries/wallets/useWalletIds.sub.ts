import { gql } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { useSubgraphClient } from '@gql/GqlProvider';
import { address, toWalletRef, toId } from 'lib';
import { QUERY_WALLETS_POLL_INTERVAL, WalletId } from '.';
import { useMemo } from 'react';
import {
  useUserWalletIdsQuery,
  SubWalletIdFieldsFragment,
} from '@gql/generated.sub';

export const SUB_WALLET_ID_FIELDS = gql`
  fragment SubWalletIdFields on Wallet {
    id
    account {
      id
    }
    ref
  }
`;

gql`
  ${SUB_WALLET_ID_FIELDS}

  query UserWalletIds($user: ID!) {
    user(id: $user) {
      quorums {
        quorum {
          wallet {
            ...SubWalletIdFields
          }
        }
      }
    }
  }
`;

export const subWalletFieldsToId = (
  w: SubWalletIdFieldsFragment,
): WalletId => ({
  id: toId(w.id),
  accountAddr: address(w.account.id),
  ref: toWalletRef(w.ref),
});

export const useSubUserWalletIds = () => {
  const device = useDevice();

  const { data, ...rest } = useUserWalletIdsQuery({
    client: useSubgraphClient(),
    variables: { user: toId(device.address) },
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
  });

  const wallets = useMemo(
    (): WalletId[] =>
      data?.user?.quorums.map(({ quorum }) =>
        subWalletFieldsToId(quorum.wallet),
      ) ?? [],
    [data?.user?.quorums],
  );

  return { data: wallets, ...rest };
};
