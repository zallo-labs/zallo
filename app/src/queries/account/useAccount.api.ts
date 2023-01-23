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

export const useAccount = <Id extends Accountlike | undefined>(id: Id) => {
  const credentials = useCredentials();
  const addr = getAccountlikeAddr(id);

  const { data, ...rest } = useSuspenseQuery<AccountQuery, AccountQueryVariables>(AccountDocument, {
    variables: { account: addr },
  });
  usePollWhenFocussed(rest, 30);

  const a = data.account;
  if (id) assert(a);

  const account = useMemo((): CombinedAccount | undefined => {
    if (!addr || !a) return undefined;

    return {
      addr,
      contract: connectAccount(addr, credentials),
      active: a.isActive,
      name: a.name,
      quorums: (a.quorums ?? []).map(CombinedQuorum.fromFragment),
    };
  }, [addr, a, credentials]);

  return account as Id extends undefined ? CombinedAccount | undefined : CombinedAccount;
};
