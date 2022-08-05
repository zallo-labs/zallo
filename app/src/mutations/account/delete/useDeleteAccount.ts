import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/accounts';
import { useApiDeleteAccount } from './useDeleteAccount.api';

export const useDeleteAccount = (account: CombinedAccount) => {
  const apiDelete = useApiDeleteAccount();

  return useCallback(() => {
    if (account.active) {
      // TODO: propose delete
    } else {
      return apiDelete(account);
    }
  }, [account, apiDelete]);
};
