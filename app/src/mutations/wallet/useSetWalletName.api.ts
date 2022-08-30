import { gql } from '@apollo/client';
import {
  useSetWalletNameMutation,
  WalletQuery,
  WalletQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import produce from 'immer';
import { useCallback } from 'react';
import { CombinedWallet } from '~/queries/wallets';
import { API_QUERY_WALLET } from '~/queries/wallet/useWallet.api';

gql`
  mutation SetWalletName($id: WalletId!, $name: String!) {
    setWalletName(id: $id, name: $name) {
      id
    }
  }
`;

export const useSetWalletName = () => {
  const [mutate] = useSetWalletNameMutation({ client: useApiClient() });

  return useCallback(
    ({ id, accountAddr, ref, name }: CombinedWallet) => {
      return mutate({
        variables: {
          id: { accountId: accountAddr, ref },
          name,
        },
        optimisticResponse: {
          setWalletName: {
            __typename: 'Wallet',
            id,
          },
        },
        update: (cache, result) => {
          if (!result.data?.setWalletName) return;

          // Wallet; upsert name
          const opts: QueryOpts<WalletQueryVariables> = {
            query: API_QUERY_WALLET,
            variables: { wallet: { accountId: accountAddr, ref } },
          };

          const data: WalletQuery = cache.readQuery<WalletQuery>(opts) ?? {
            wallet: null,
          };

          cache.writeQuery<WalletQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              if (data.wallet) {
                data.wallet.name = name;
              } else {
                data.wallet = {
                  id,
                  name,
                  quorums: [],
                  spendingAllowlisted: false,
                  limits: [],
                };
              }
            }),
          });
        },
      });
    },
    [mutate],
  );
};
