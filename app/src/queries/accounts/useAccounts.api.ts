import { gql, useQuery } from '@apollo/client';
import { UserAccountsQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { toId, address, toAccountRef, toQuorum, toQuorums } from 'lib';
import { useMemo } from 'react';
import { CombinedAccount, QUERY_ACCOUNTS_POLL_INTERVAL } from '.';

export const API_ACCOUNT_FIELDS = gql`
  fragment AccountFields on Account {
    id
    safeId
    ref
    name
    quorums {
      approvers {
        userId
      }
    }
  }
`;

export const API_QUERY_USER_ACCOUNTS = gql`
  ${API_ACCOUNT_FIELDS}

  query UserAccounts {
    userAccounts {
      ...AccountFields
    }
  }
`;

export const useApiUserAccounts = () => {
  const { data, ...rest } = useQuery<UserAccountsQuery>(
    API_QUERY_USER_ACCOUNTS,
    {
      client: useApiClient(),
      pollInterval: QUERY_ACCOUNTS_POLL_INTERVAL,
    },
  );

  const accounts = useMemo(
    (): CombinedAccount[] =>
      data?.userAccounts.map(
        (acc): CombinedAccount => ({
          id: toId(acc.id),
          safeAddr: address(acc.safeId),
          ref: toAccountRef(acc.ref),
          name: acc.name ? acc.name : undefined,
          quorums: toQuorums(
            acc.quorums?.map((quorum) =>
              toQuorum(quorum.approvers?.map((a) => address(a.userId)) ?? []),
            ) ?? [],
          ),
        }),
      ) ?? [],
    [data?.userAccounts],
  );

  return { data: accounts, ...rest };
};
