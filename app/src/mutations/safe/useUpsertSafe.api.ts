import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { CombinedAccount } from '~/queries/accounts';
import { API_ACCOUNT_FIELDS } from '~/queries/accounts/useAccounts.api';
import {
  SafeQuery,
  SafeQueryVariables,
  UserSafesQuery,
  UserSafesQueryVariables,
  useUpsertSafeMutation,
} from '@gql/generated.api';
import { Address, getAccountId, hashQuorum, toId } from 'lib';
import { API_SAFE_QUERY } from '~/queries/safe/useSafe.api';
import { API_USER_SAFES_QUERY } from '~/queries/safe/useSafes.api';
import produce from 'immer';

export const API_QUERY_UPSERT_SAFE = gql`
  ${API_ACCOUNT_FIELDS}

  mutation UpsertSafe(
    $safe: Address!
    $impl: Address
    $deploySalt: Bytes32
    $name: String
    $accounts: [AccountInput!]
  ) {
    upsertSafe(
      safe: $safe
      impl: $impl
      deploySalt: $deploySalt
      name: $name
      accounts: $accounts
    ) {
      id
      name
      impl
      deploySalt
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

export const useUpsertApiSafe = () => {
  const [mutation] = useUpsertSafeMutation({
    client: useApiClient(),
  });

  const upsert = ({
    addr,
    impl,
    deploySalt,
    name,
    accounts,
  }: UpsertApiSafeOptions) =>
    mutation({
      variables: {
        safe: addr,
        impl,
        deploySalt,
        name,
        accounts: accounts.map((acc) => ({
          ref: acc.ref,
          name: acc.name,
          quorums: acc.quorums,
        })),
      },
      optimisticResponse: {
        __typename: 'Mutation',
        upsertSafe: {
          id: toId(addr),
          impl,
          deploySalt,
          name,
          accounts: accounts.map((acc) => ({
            __typename: 'Account',
            id: getAccountId(addr, acc.ref),
            safeId: addr,
            ref: acc.ref,
            name: acc.name,
            quorums: acc.quorums.map((quorum) => ({
              __typename: 'Quorum',
              hash: hashQuorum(quorum),
              approvers: quorum.map((approver) => ({
                typename: 'Approver',
                userId: approver,
              })),
            })),
          })),
        },
      },
      update: (cache, res) => {
        const safe = res?.data?.upsertSafe;
        if (!safe) return;

        // Safe query
        const safeOpts: QueryOpts<SafeQueryVariables> = {
          query: API_SAFE_QUERY,
          variables: { id: safe.id },
        };

        cache.writeQuery<SafeQuery>({
          ...safeOpts,
          overwrite: true,
          data: {
            __typename: 'Query',
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
      },
    });

  return upsert;
};
