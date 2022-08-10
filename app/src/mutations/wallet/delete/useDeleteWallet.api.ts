import { gql } from '@apollo/client';
import {
  AccountQuery,
  AccountQueryVariables,
  useDeleteWalletMutation,
  UserWalletIdsQuery,
  UserWalletIdsQueryVariables,
  WalletQuery,
  WalletQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { useCallback } from 'react';
import { API_ACCOUNT_QUERY } from '~/queries/account/useAccount.api';
import { CombinedWallet } from '~/queries/wallets';
import { API_QUERY_WALLET } from '~/queries/wallets/useWallet.api';
import { API_QUERY_USER_WALLETS } from '~/queries/wallets/useWalletIds.api';

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

          {
            // UserWalletIds; remove the wallet
            const opts: QueryOpts<UserWalletIdsQueryVariables> = {
              query: API_QUERY_USER_WALLETS,
              variables: {},
            };

            const data: UserWalletIdsQuery =
              cache.readQuery<UserWalletIdsQuery>(opts) ?? {
                userWallets: [],
              };

            cache.writeQuery<UserWalletIdsQuery>({
              ...opts,
              overwrite: true,
              data: produce(data, (data) => {
                data.userWallets = data.userWallets.filter(
                  (w) => w.id !== wallet.id,
                );
              }),
            });
          }

          {
            // Wallet; remove from cache
            cache.writeQuery<WalletQuery, WalletQueryVariables>({
              query: API_QUERY_WALLET,
              variables: {
                wallet: { accountId: wallet.accountAddr, ref: wallet.ref },
              },
              data: { wallet: null },
            });
          }

          {
            // Account; remove wallet
            const opts: QueryOpts<AccountQueryVariables> = {
              query: API_ACCOUNT_QUERY,
              variables: { account: wallet.accountAddr },
            };

            const data = cache.readQuery<AccountQuery>(opts);
            if (data) {
              cache.writeQuery<AccountQuery>({
                ...opts,
                overwrite: true,
                data: produce(data, (data) => {
                  if (data.account?.wallets) {
                    data.account.wallets = data.account.wallets.filter(
                      (w) => w.id !== wallet.id,
                    );
                  }
                }),
              });
            }
          }
        },
      }),
    [mutate],
  );
};
