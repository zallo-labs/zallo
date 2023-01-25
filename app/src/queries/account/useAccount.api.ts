import { Address, QuorumGuid } from 'lib';
import { useMemo } from 'react';
import assert from 'assert';
import { CombinedAccount } from '.';
import { useAccounts } from './useAccounts.api';

export type Accountlike = Address | QuorumGuid;

export const getAccountlikeAddr = (account?: Accountlike) =>
  typeof account === 'object' ? account.account : account || null;

export const useAccount = <Id extends Accountlike | undefined>(id: Id) => {
  const accounts = useAccounts();

  const account = useMemo(() => {
    if (!id) return undefined;

    const addr = getAccountlikeAddr(id);
    return accounts.find((a) => a.addr === addr);
  }, [accounts, id]);

  if (id) assert(account);
  return account as Id extends undefined ? CombinedAccount | undefined : CombinedAccount;
};
