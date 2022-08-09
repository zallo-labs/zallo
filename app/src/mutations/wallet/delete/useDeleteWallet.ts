import { useCallback } from 'react';
import { CombinedWallet } from '~/queries/wallets';
import { useApiDeleteWallet } from './useDeleteWallet.api';

export const useDeleteWallet = (wallet: CombinedWallet) => {
  const apiDelete = useApiDeleteWallet();

  return useCallback(() => {
    if (wallet.active) {
      // TODO: propose delete
    } else {
      return apiDelete(wallet);
    }
  }, [wallet, apiDelete]);
};
