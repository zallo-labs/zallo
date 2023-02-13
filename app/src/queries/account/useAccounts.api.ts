import { gql } from '@apollo/client';
import { useCredentials } from '@network/useCredentials';
import { address, connectAccount } from 'lib';
import { useMemo } from 'react';
import {
  QuorumFieldsFragmentDoc,
  AccountsDocument,
  AccountsQuery,
  AccountsQueryVariables,
} from '~/gql/generated.api';
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
