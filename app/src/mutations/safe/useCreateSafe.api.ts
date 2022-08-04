import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { CombinedAccount } from '~/queries/accounts';
import {
  SafeQuery,
  SafeQueryVariables,
  useCreateSafeMutation,
  UserSafesQuery,
  UserSafesQueryVariables,
} from '@gql/generated.api';
import {
  Address,
  calculateProxyAddress,
  getAccountId,
  hashQuorum,
  randomAccountRef,
  randomDeploySalt,
  toId,
  toQuorums,
  toQuorum,
} from 'lib';
import { API_SAFE_QUERY } from '~/queries/safe/useSafe.api';
import {
  API_SAFE_FIELDS,
  API_USER_SAFES_QUERY,
} from '~/queries/safe/useSafes.api';
import produce from 'immer';
import { API_ACCOUNT_FIELDS } from '~/queries/accounts/useAccounts.api';
import { updateApiUserAccountsCache } from '../account/useSetAccountQuorums.api';
import { SAFE_IMPL } from '~/provider';
import { useWallet } from '@features/wallet/useWallet';
import { useSafeProxyFactory } from '@features/safe/useSafeProxyFactory';

export const API_QUERY_UPSERT_SAFE = gql`
  ${API_SAFE_FIELDS}
  ${API_ACCOUNT_FIELDS}

  mutation CreateSafe(
    $safe: Address!
    $impl: Address!
    $deploySalt: Bytes32!
    $name: String!
    $accounts: [AccountWithoutSafeInput!]!
  ) {
    createSafe(
      safe: $safe
      impl: $impl
      deploySalt: $deploySalt
      name: $name
      accounts: $accounts
    ) {
      ...SafeFields
      accounts {
        ...AccountFields
      }
    }
  }
`;

export interface UpsertApiSafeOptions {
  addr: Address;
  impl: Address;
  deploySalt?: string;
  name: string;
  accounts: Omit<CombinedAccount, 'id' | 'safeAddr'>[];
}

export const useCreateApiSafe = () => {
  const wallet = useWallet();
  const factory = useSafeProxyFactory();
  const [mutation] = useCreateSafeMutation({ client: useApiClient() });

  const upsert = async (name: string, accountName: string) => {
    const account: Omit<CombinedAccount, 'id' | 'safeAddr'> = {
      ref: randomAccountRef(),
      quorums: [{ approvers: toQuorum([wallet.address]) }],
      name: accountName,
    };
    const accounts = [account];
    const impl = SAFE_IMPL;

    const deploySalt = randomDeploySalt();

    const safeAddr = await calculateProxyAddress(
      {
        impl,
        account: {
          ref: account.ref,
          quorums: toQuorums(account.quorums.map((q) => q.approvers)),
        },
      },
      factory,
      deploySalt,
    );

    return await mutation({
      variables: {
        safe: safeAddr,
        impl,
        deploySalt,
        name,
        accounts: accounts.map((acc) => ({
          ref: acc.ref,
          name: acc.name,
          quorums: acc.quorums.map((quorum) => quorum.approvers),
        })),
      },
      optimisticResponse: {
        createSafe: {
          __typename: 'Safe',
          id: toId(safeAddr),
          impl,
          deploySalt,
          name,
          accounts: accounts.map((acc) => ({
            __typename: 'Account',
            id: getAccountId(safeAddr, acc.ref),
            safeId: safeAddr,
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
        if (!res?.data?.createSafe) return;
        const { accounts, ...safe } = res.data.createSafe;

        // Safe query
        const safeOpts: QueryOpts<SafeQueryVariables> = {
          query: API_SAFE_QUERY,
          variables: { id: safe.id },
        };

        cache.writeQuery<SafeQuery>({
          ...safeOpts,
          overwrite: true,
          data: {
            safe,
          },
        });

        // UserSafes query
        const safesOpts: QueryOpts<UserSafesQueryVariables> = {
          query: API_USER_SAFES_QUERY,
        };

        const data: UserSafesQuery = cache.readQuery<UserSafesQuery>(
          safesOpts,
        ) ?? {
          userSafes: [],
        };

        cache.writeQuery<UserSafesQuery>({
          ...safesOpts,
          overwrite: true,
          data: produce(data, (data) => {
            const i = data.userSafes.findIndex((s) => s.id === safe.id);
            if (i >= 0) {
              data.userSafes[i] = safe;
            } else {
              data.userSafes.push(safe);
            }
          }),
        });

        // User accounts
        if (accounts) updateApiUserAccountsCache(cache, accounts);
      },
    });
  };

  return upsert;
};
