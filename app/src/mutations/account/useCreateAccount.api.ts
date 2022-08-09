import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { CombinedWallet } from '~/queries/wallets';
import {
  AccountQuery,
  AccountQueryVariables,
  useCreateAccountMutation,
  UserAccountsQuery,
  UserAccountsQueryVariables,
} from '@gql/generated.api';
import {
  Address,
  calculateProxyAddress,
  getWalletId,
  hashQuorum,
  randomWalletRef,
  randomDeploySalt,
  toId,
  toQuorums,
  toQuorum,
} from 'lib';
import { API_ACCOUNT_QUERY } from '~/queries/account/useAccount.api';
import {
  API_ACCOUNT_FIELDS,
  API_USER_ACCOUNTS_QUERY,
} from '~/queries/account/useAccounts.api';
import produce from 'immer';
import { API_WALLET_FIELDS } from '~/queries/wallets/useWallets.api';
import { updateApiUserWalletsCache } from '../wallet/useSetWalletQuorums.api';
import { ACCOUNT_IMPL } from '~/provider';
import { useDevice } from '@features/device/useDevice';
import { useAccountProxyFactory } from '@features/account/useAccountProxyFactory';

export const API_QUERY_UPSERT_ACCOUNT = gql`
  ${API_ACCOUNT_FIELDS}
  ${API_WALLET_FIELDS}

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
      ...AccountFields
      wallets {
        ...WalletFields
      }
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
        wallet: {
          ref: wallet.ref,
          quorums: toQuorums(wallet.quorums.map((q) => q.approvers)),
        },
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
          impl,
          deploySalt,
          name,
          wallets: wallets.map((acc) => ({
            __typename: 'Wallet',
            id: getWalletId(accountAddr, acc.ref),
            accountId: accountAddr,
            ref: acc.ref,
            name: acc.name,
            quorums: acc.quorums.map((quorum) => ({
              __typename: 'Quorum',
              hash: hashQuorum(quorum.approvers),
              approvers: quorum.approvers.map((approver) => ({
                __typename: 'Approver',
                userId: approver,
              })),
            })),
          })),
        },
      },
      update: (cache, res) => {
        if (!res?.data?.createAccount) return;
        const { wallets, ...account } = res.data.createAccount;

        // Account query
        const accountOpts: QueryOpts<AccountQueryVariables> = {
          query: API_ACCOUNT_QUERY,
          variables: { id: account.id },
        };

        cache.writeQuery<AccountQuery>({
          ...accountOpts,
          overwrite: true,
          data: {
            account,
          },
        });

        // UserAccounts query
        const accountsOpts: QueryOpts<UserAccountsQueryVariables> = {
          query: API_USER_ACCOUNTS_QUERY,
        };

        const data: UserAccountsQuery = cache.readQuery<UserAccountsQuery>(
          accountsOpts,
        ) ?? {
          userAccounts: [],
        };

        cache.writeQuery<UserAccountsQuery>({
          ...accountsOpts,
          overwrite: true,
          data: produce(data, (data) => {
            const i = data.userAccounts.findIndex((s) => s.id === account.id);
            if (i >= 0) {
              data.userAccounts[i] = account;
            } else {
              data.userAccounts.push(account);
            }
          }),
        });

        // User wallets
        if (wallets) updateApiUserWalletsCache(cache, wallets);
      },
    });
  };

  return upsert;
};
