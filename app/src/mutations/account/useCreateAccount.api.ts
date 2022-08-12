import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import {
  AccountQuery,
  AccountQueryVariables,
  useCreateAccountMutation,
  UserWalletIdsQuery,
  UserWalletIdsQueryVariables,
  WalletQuery,
  WalletQueryVariables,
} from '@gql/generated.api';
import {
  Address,
  calculateProxyAddress,
  randomWalletRef,
  randomDeploySalt,
  toId,
  toQuorum,
  getWalletId,
} from 'lib';
import { API_ACCOUNT_QUERY } from '~/queries/account/useAccount.api';
import produce from 'immer';
import { ACCOUNT_IMPL } from '~/provider';
import { useDevice } from '@features/device/useDevice';
import { useAccountProxyFactory } from '@features/account/useAccountProxyFactory';
import { API_QUERY_WALLET } from '~/queries/wallets/useWallet.api';
import { API_QUERY_USER_WALLETS } from '~/queries/wallets/useWalletIds.api';

gql`
  mutation CreateAccount(
    $account: Address!
    $impl: Address!
    $deploySalt: Bytes32!
    $name: String!
    $wallets: [WalletWithoutAccountInput!]!
  ) {
    createAccount(
      account: $account
      impl: $impl
      deploySalt: $deploySalt
      name: $name
      wallets: $wallets
    ) {
      id
    }
  }
`;

export interface UpsertApiAccountOptions {
  addr: Address;
  impl: Address;
  deploySalt?: string;
  name: string;
  wallets: Omit<CombinedWallet, 'id' | 'accountAddr'>[];
}

export const useCreateApiAccount = () => {
  const device = useDevice();
  const factory = useAccountProxyFactory();
  const [mutation] = useCreateAccountMutation({ client: useApiClient() });

  const upsert = async (name: string, walletName: string) => {
    const wallet: Omit<CombinedWallet, 'id' | 'accountAddr'> = {
      ref: randomWalletRef(),
      quorums: [{ approvers: toQuorum([device.address]) }],
      name: walletName,
    };
    const wallets = [wallet];
    const impl = ACCOUNT_IMPL;

    const deploySalt = randomDeploySalt();

    const accountAddr = await calculateProxyAddress(
      {
        impl,
        wallet: toWallet(wallet),
      },
      factory,
      deploySalt,
    );

    return await mutation({
      variables: {
        account: accountAddr,
        impl,
        deploySalt,
        name,
        wallets: wallets.map((acc) => ({
          ref: acc.ref,
          name: acc.name,
          quorums: acc.quorums.map((quorum) => quorum.approvers),
        })),
      },
      optimisticResponse: {
        createAccount: {
          __typename: 'Account',
          id: toId(accountAddr),
        },
      },
      update: (cache, res) => {
        if (!res?.data?.createAccount) return;

        // Account: create
        cache.writeQuery<AccountQuery, AccountQueryVariables>({
          query: API_ACCOUNT_QUERY,
          variables: { account: accountAddr },
          data: {
            account: {
              id: toId(accountAddr),
              name,
              deploySalt,
              impl,
              wallets: wallets.map((w) => ({
                __typename: 'Wallet',
                id: getWalletId(accountAddr, w.ref),
                accountId: accountAddr,
                ref: w.ref,
              })),
            },
          },
        });

        // Wallet: create each wallet
        for (const w of wallets) {
          cache.writeQuery<WalletQuery, WalletQueryVariables>({
            query: API_QUERY_WALLET,
            variables: { wallet: { accountId: accountAddr, ref: w.ref } },
            data: {
              wallet: {
                __typename: 'Wallet',
                id: getWalletId(accountAddr, w.ref),
                accountId: accountAddr,
                ref: w.ref,
                name: w.name,
                quorums: w.quorums.map((q) => ({
                  __typename: 'Quorum',
                  approvers: q.approvers.map((approver) => ({
                    __typename: 'Approver',
                    userId: approver,
                  })),
                })),
              },
            },
          });
        }

        // UserWalletIds: add wallets
        const userWalletIdsOpts: QueryOpts<UserWalletIdsQueryVariables> = {
          query: API_QUERY_USER_WALLETS,
          variables: {},
        };

        const userWalletIdsData: UserWalletIdsQuery =
          cache.readQuery<UserWalletIdsQuery>(userWalletIdsOpts) ?? {
            userWallets: [],
          };

        cache.writeQuery<UserWalletIdsQuery>({
          ...userWalletIdsOpts,
          overwrite: true,
          data: produce(userWalletIdsData, (data) => {
            data.userWallets.push(
              ...wallets.map((w): UserWalletIdsQuery['userWallets'][0] => ({
                __typename: 'Wallet',
                id: getWalletId(accountAddr, w.ref),
                accountId: accountAddr,
                ref: w.ref,
              })),
            );
          }),
        });
      },
    });
  };

  return upsert;
};
