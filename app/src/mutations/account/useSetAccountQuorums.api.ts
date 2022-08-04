import { ApolloCache, gql } from '@apollo/client';
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
  useSetAccountQuorumsMutation,
} from '@gql/generated.api';

gql`
  ${API_ACCOUNT_FIELDS}

  mutation SetAccountQuorums(
    $setQuroumsId: AccountId!
    $quorums: [QuorumScalar!]!
    $txHash: Bytes32!
  ) {
    setAccountQuroums(id: $setQuroumsId, quorums: $quorums, txHash: $txHash) {
      ...AccountFields
    }
  }
`;

export const updateApiUserAccountsCache = (
  cache: ApolloCache<any>,
  accounts: UserAccountsQuery['userAccounts'],
) => {
  const opts: QueryOpts<never> = { query: API_QUERY_USER_ACCOUNTS };
  const data: UserAccountsQuery = cache.readQuery<UserAccountsQuery>(opts) ?? {
    userAccounts: [],
  };

  cache.writeQuery<UserAccountsQuery>({
    ...opts,
    overwrite: true,
    data: produce(data, (data) => {
      if (!data.userAccounts) data.userAccounts = [];

      for (const account of accounts) {
        const i = data.userAccounts.findIndex((a) => a.id === account.id);
        if (i >= 0) {
          data.userAccounts[i] = account;
        } else {
          data.userAccounts.push(account);
        }
      }
    }),
  });
};

export const useApiSetAccountQuorums = () => {
  const [mutation] = useSetAccountQuorumsMutation({ client: useApiClient() });

  const upsert = (
    { id, safeAddr, ref, name, quorums }: CombinedAccount,
    txHash: string,
  ) =>
    mutation({
      variables: {
        setQuroumsId: {
          safeId: safeAddr,
          ref,
        },
        quorums: quorums.map((quorum) =>
          quorum.approvers.map((approver) => ({
            userId: approver,
          })),
        ),
        txHash,
      },
      optimisticResponse: {
        setAccountQuroums: {
          __typename: 'Account',
          id,
          safeId: safeAddr,
          ref,
          name,
          quorums: quorums.map((quorum) => ({
            __typename: 'Quorum',
            approvers: quorum.approvers.map((approver) => ({
              __typename: 'Approver',
              userId: approver,
            })),
          })),
        },
      },
      update: (cache, res) => {
        const acc = res?.data?.setAccountQuroums;
        if (acc?.__typename) updateApiUserAccountsCache(cache, [acc]);
      },
    });

  return upsert;
};
