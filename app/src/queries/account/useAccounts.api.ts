import { gql } from '@apollo/client';
import { useApprover } from '@network/useApprover';
import { asAddress, connectAccount } from 'lib';
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
  const approver = useApprover();

  const { data } = useSuspenseQuery<AccountsQuery, AccountsQueryVariables>(AccountsDocument, {
    variables: {},
  });

  return useMemo(
    (): CombinedAccount[] =>
      data.accounts.map((a): CombinedAccount => {
        const addr = asAddress(a.id);

        return {
          addr,
          contract: connectAccount(addr, approver),
          active: a.isActive,
          name: a.name,
          quorums: (a.quorums ?? []).map(CombinedQuorum.fromFragment),
        };
      }),
    [approver, data.accounts],
  );
};

export const useAccountIds = () => {
  const accounts = useAccounts();

  return useMemo(() => accounts.map((a) => a.addr), [accounts]);
};
