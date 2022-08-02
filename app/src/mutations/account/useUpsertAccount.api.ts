import { gql } from '@apollo/client';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { CombinedAccount } from '~/queries/accounts';
import {
  API_ACCOUNT_FIELDS,
  API_QUERY_USER_ACCOUNTS,
} from '~/queries/accounts/useAccounts.api';
import {
  UserAccountsQuery,
  useUpsertAccountMutation,
} from '@gql/generated.api';

const MUTATION = gql`
  ${API_ACCOUNT_FIELDS}

  mutation UpsertAccount($account: AccountInput!, $safe: Address!) {
    upsertAccount(account: $account, safe: $safe) {
      ...AccountFields
    }
  }
`;

export const useUpsertApiAccount = () => {
  const isDeployed = useIsDeployed();

  const [mutation] = useUpsertAccountMutation({
    client: useApiClient(),
  });

  const upsert = (acc: CombinedAccount) =>
    mutation({
      variables: {
        safe: acc.safeAddr,
        account: {
          ref: acc.ref,
          name: acc.name,
          // Only maintain a list of approvers if the safe is counterfactual
          quorums: isDeployed ? [] : acc.quorums,
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        upsertAccount: {
          __typename: 'Account',
          id: acc.id,
          safeId: acc.safeAddr,
          ref: acc.ref,
          name: acc.name ?? '',
          quorums: acc.quorums.map((quorum) => ({
            __typename: 'Quorum',
            approvers: quorum.map((approver) => ({
              __typename: 'Approver',
              userId: approver,
            })),
          })),
        },
      },
      update: (cache, res) => {
        const acc = res?.data?.upsertAccount;
        if (!acc) return;

        const opts: QueryOpts<never> = { query: API_QUERY_USER_ACCOUNTS };
        const data: UserAccountsQuery = cache.readQuery<UserAccountsQuery>(
          opts,
        ) ?? { __typename: 'Query', userAccounts: [] };

        cache.writeQuery<UserAccountsQuery>({
          ...opts,
          overwrite: true,
          data: produce(data, (data) => {
            if (!data.userAccounts) data.userAccounts = [];

            const i = data.userAccounts.findIndex((a) => a.id === acc.id);
            if (i >= 0) {
              data.userAccounts[i] = acc;
            } else {
              data.userAccounts.push(acc);
            }
          }),
        });
      },
    });

  return upsert;
};
