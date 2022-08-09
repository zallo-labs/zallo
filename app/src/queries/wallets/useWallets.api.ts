import { gql, useQuery } from '@apollo/client';
import { UserWalletsQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { toId, address, toWalletRef, toQuorum } from 'lib';
import { useMemo } from 'react';
import { CombinedWallet, QUERY_WALLETS_POLL_INTERVAL } from '.';

export const API_WALLET_FIELDS = gql`
  fragment WalletFields on Wallet {
    id
    accountId
    ref
    name
    quorums {
      approvers {
        userId
      }
    }
  }
`;

export const API_QUERY_USER_WALLETS = gql`
  ${API_WALLET_FIELDS}

  query UserWallets {
    userWallets {
      ...WalletFields
    }
  }
`;

export const useApiUserWallets = () => {
  const { data, ...rest } = useQuery<UserWalletsQuery>(API_QUERY_USER_WALLETS, {
    client: useApiClient(),
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
  });

  const wallets = useMemo(
    (): CombinedWallet[] =>
      data?.userWallets.map(
        (acc): CombinedWallet => ({
          id: toId(acc.id),
          accountAddr: address(acc.accountId),
          ref: toWalletRef(acc.ref),
          name: acc.name,
          quorums:
            acc.quorums?.map((quorum) => ({
              approvers: toQuorum(
                quorum.approvers?.map((a) => address(a.userId)) ?? [],
              ),
            })) ?? [],
        }),
      ) ?? [],
    [data?.userWallets],
  );

  return { data: wallets, ...rest };
};
