import { gql } from '@apollo/client';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { CombinedWallet, toSafeWallet } from '~/queries/wallets';
import {
  AccountQuery,
  AccountQueryVariables,
  ProposableStatus,
  useCreateAccountMutation,
  UserAccountsMetadataDocument,
  UserAccountsMetadataQuery,
  UserAccountsMetadataQueryVariables,
  UserWalletIdsQuery,
  UserWalletIdsQueryVariables,
  WalletQuery,
  WalletQueryVariables,
} from '~/gql/generated.api';
import {
  Address,
  calculateProxyAddress,
  randomWalletRef,
  randomDeploySalt,
  toId,
  toQuorum,
  getWalletId,
  hashQuorum,
} from 'lib';
import { API_ACCOUNT_QUERY } from '~/queries/account/useAccount.api';
import produce from 'immer';
import { ACCOUNT_IMPL } from '~/util/network/provider';
import { useDevice } from '@network/useDevice';
import { API_QUERY_WALLET } from '~/queries/wallets/useWallet.api';
import { API_QUERY_USER_WALLETS } from '~/queries/wallets/useWalletIds.api';
import { useAccountProxyFactory } from '@network/useAccountProxyFactory';

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
    const wallet: Pick<CombinedWallet, 'ref' | 'quorums' | 'name'> = {
      ref: randomWalletRef(),
      quorums: [{ approvers: toQuorum([device.address]), state: 'add' }],
      name: walletName,
    };
    const wallets = [wallet];
    const impl = ACCOUNT_IMPL;

    const deploySalt = randomDeploySalt();

    const accountAddr = await calculateProxyAddress(
      {
        impl,
        wallet: toSafeWallet(wallet),
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
        const id = res.data?.createAccount.id;
        if (!id) return;

        {
          // User Account Metadata; upsert
          const opts: QueryOpts<UserAccountsMetadataQueryVariables> = {
            query: UserAccountsMetadataDocument,
            variables: {},
          };

          const data: UserAccountsMetadataQuery =
            cache.readQuery<UserAccountsMetadataQuery>(opts) ?? {
              userAccounts: [],
            };

          cache.writeQuery<UserAccountsMetadataQuery>({
            ...opts,
            data: produce(data, (data) => {
              const i = data.userAccounts.findIndex((a) => a.id === id);
              if (i >= 0) {
                data.userAccounts[i] = {
                  __typename: 'Account',
                  id,
                  name,
                };
              } else {
                data.userAccounts.push({
                  __typename: 'Account',
                  id,
                  name,
                });
              }
            }),
          });
        }

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
                name: w.name,
                state: {
                  __typename: 'ProposableState',
                  status: ProposableStatus.Add,
                  proposedModificationHash: null,
                },
                quorums: w.quorums.map((q) => ({
                  __typename: 'Quorum',
                  accountId: accountAddr,
                  walletRef: w.ref,
                  hash: hashQuorum(q.approvers),
                  approvers: q.approvers.map((approver) => ({
                    __typename: 'Approver',
                    userId: approver,
                  })),
                  state: {
                    __typename: 'ProposableState',
                    status: ProposableStatus.Add,
                    proposedModificationHash: null,
                  },
                })),
              },
            },
          });
        }

        {
          // UserWalletIds: add wallet ids if missing
          const opts: QueryOpts<UserWalletIdsQueryVariables> = {
            query: API_QUERY_USER_WALLETS,
            variables: {},
          };

          const data: UserWalletIdsQuery = cache.readQuery<UserWalletIdsQuery>(
            opts,
          ) ?? {
            userWallets: [],
          };

          cache.writeQuery<UserWalletIdsQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              const walletId = getWalletId(accountAddr, wallet.ref);
              if (!data.userWallets.find((w) => w.id === walletId)) {
                data.userWallets.push(
                  ...wallets.map((w): UserWalletIdsQuery['userWallets'][0] => ({
                    __typename: 'Wallet',
                    id: getWalletId(accountAddr, w.ref),
                    accountId: accountAddr,
                    ref: w.ref,
                  })),
                );
              }
            }),
          });
        }
      },
    });
  };

  return upsert;
};
