import { gql } from '@apollo/client';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  QuorumFieldsFragmentDoc,
} from '~/gql/generated.api';
import { Account, Address, connectAccount, QuorumGuid } from 'lib';
import { useMemo } from 'react';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { useCredentials } from '@network/useCredentials';
import assert from 'assert';
import { CombinedQuorum } from '../quroum';

export interface CombinedAccount {
  addr: Address;
  contract: Account;
  name: string;
  active?: boolean;
  quorums: CombinedQuorum[];
}

gql`
  ${QuorumFieldsFragmentDoc}

  query Account($account: Address!) {
    account(id: $account) {
      id
      isActive
      name
      quorums {
        ...QuorumFields
      }
    }
  }
`;

export type Accountlike = Address | QuorumGuid;

export const getAccountlikeAddr = (account?: Accountlike) =>
  typeof account === 'object' ? account.account : account || null;

export const useAccount = (id: Accountlike) => {
  const credentials = useCredentials();
  const addr = typeof id === 'string' ? id : id.account;

  const { data, ...rest } = useSuspenseQuery<AccountQuery, AccountQueryVariables>(AccountDocument, {
    variables: { account: addr },
  });
  usePollWhenFocussed(rest, 30);

  const a = data.account;
  assert(a);

  const account = useMemo(
    (): CombinedAccount => ({
      addr,
      contract: connectAccount(addr, credentials),
      active: a.isActive,
      name: a.name,
      quorums: (a.quorums ?? []).map(CombinedQuorum.fromFragment),
    }),
    [addr, credentials, a.isActive, a.name, a.quorums],
  );

  return account;
};
