import { gql } from '@apollo/client';
import { useCredentials } from '@network/useCredentials';
import { address, connectAccount } from 'lib';
import { useMemo } from 'react';
import {
  QuorumFieldsFragmentDoc,
  AccountsDocument,
  AccountsQuery,
  AccountsQueryVariables,
  useAccountSubscriptionSubscription,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { CombinedAccount } from '.';
import { CombinedQuorum } from '../quroum';

gql`
  ${QuorumFieldsFragmentDoc}

  fragment AccountFields on Account {
    id
    isActive
    name
    quorums {
      ...QuorumFields
    }
  }

  query Accounts {
    accounts {
      ...AccountFields
    }
  }

  subscription AccountSubscription {
    account {
      ...AccountFields
    }
  }
`;

export const useAccounts = () => {
  const credentials = useCredentials();

  const { data } = useSuspenseQuery<AccountsQuery, AccountsQueryVariables>(AccountsDocument, {
    variables: {},
  });

  useAccountSubscriptionSubscription({
    onData: ({ client: { cache }, data: { data } }) => {
      const account = data?.account;
      if (!account) return;

      updateQuery<AccountsQuery, AccountsQueryVariables>({
        cache,
        query: AccountsDocument,
        variables: {},
        defaultData: { accounts: [] },
        updater: (data) => {
          const i = data.accounts.findIndex((a) => a.id === account.id);
          data.accounts[i >= 0 ? i : data.accounts.length] = account;
        },
      });
    },
  });

  return useMemo(
    (): CombinedAccount[] =>
      data.accounts.map((a): CombinedAccount => {
        const addr = address(a.id);

        return {
          addr,
          contract: connectAccount(addr, credentials),
          active: a.isActive,
          name: a.name,
          quorums: (a.quorums ?? []).map(CombinedQuorum.fromFragment),
        };
      }),
    [credentials, data.accounts],
  );
};

export const useAccountIds = () => {
  const accounts = useAccounts();

  return useMemo(() => accounts.map((a) => a.addr), [accounts]);
};
