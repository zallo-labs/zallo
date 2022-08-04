import { gql, useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { useSubgraphClient } from '@gql/GqlProvider';
import { address, toAccountRef, toId, toQuorum } from 'lib';
import {
  CombinedAccount,
  CombinedQuorum,
  QUERY_ACCOUNTS_POLL_INTERVAL,
} from '.';
import { useMemo } from 'react';
import {
  UserAccountsQuery,
  UserAccountsQueryVariables,
} from '@gql/generated.sub';

const QUERY = gql`
  query UserAccounts($user: ID!) {
    user(id: $user) {
      quorums(where: { active: true }) {
        account {
          id
          ref
          safe {
            id
          }
          quorums(where: { active: true }) {
            id
            hash
            approvers {
              id
            }
            timestamp
          }
        }
      }
    }
  }
`;

export const useSubUserAccounts = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<
    UserAccountsQuery,
    UserAccountsQueryVariables
  >(QUERY, {
    client: useSubgraphClient(),
    variables: { user: toId(wallet.address) },
    pollInterval: QUERY_ACCOUNTS_POLL_INTERVAL,
  });

  const accounts = useMemo(
    (): CombinedAccount[] =>
      data?.user?.quorums.map(({ account }) => ({
        id: toId(account.id),
        safeAddr: address(account.safe.id),
        ref: toAccountRef(account.ref),
        name: '',
        quorums: account.quorums.map(
          (quorum): CombinedQuorum => ({
            approvers: toQuorum(quorum.approvers.map((a) => address(a.id))),
            active: true,
          }),
        ),
      })) ?? [],
    [data?.user?.quorums],
  );

  return { data: accounts, ...rest };
};
