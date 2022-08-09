import { gql } from '@apollo/client';
import {
  useDeleteWalletMutation,
  UserWalletsQuery,
  UserWalletsQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { useCallback } from 'react';
import { CombinedWallet } from '~/queries/wallets';
import { API_QUERY_USER_WALLETS } from '~/queries/wallets/useWallets.api';

gql`
  mutation DeleteWallet($id: WalletId!) {
    deleteWallet(id: $id)
  }
`;

export const useApiDeleteWallet = () => {
  const [mutate] = useDeleteWalletMutation({ client: useApiClient() });

  return useCallback(
    (wallet: CombinedWallet) =>
      mutate({
        variables: {
          id: { accountId: wallet.accountAddr, ref: wallet.ref },
        },
        optimisticResponse: {
          deleteWallet: true,
        },
        update: (cache, res) => {
          const success = res?.data?.deleteWallet;
          if (!success) return;

          const opts: QueryOpts<UserWalletsQueryVariables> = {
            query: API_QUERY_USER_WALLETS,
            variables: {},
          };

          const data: UserWalletsQuery = cache.readQuery<UserWalletsQuery>(
            opts,
          ) ?? { userWallets: [] };

          cache.writeQuery<UserWalletsQuery>({
            ...opts,
            overwrite: true,
            data: {
              userWallets: data.userWallets.filter(
                (acc) => acc.id !== wallet.id,
              ),
            },
          });
        },
      }),
    [mutate],
  );
};
