import { useMemo } from 'react';
import { AccountId } from '.';
import { useAccounts } from './useAccounts';

export const useAccount = (id: AccountId) => {
  const { accounts } = useAccounts();

  return useMemo(
    () =>
      accounts.find(
        (acc) => acc.safeAddr === id.safeAddr && acc.ref === id.ref,
      )!,
    [accounts, id],
  );
};
