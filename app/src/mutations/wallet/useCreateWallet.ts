import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useCreateWallet = () => {
  const { navigate } = useRootNavigation();

  return useCallback(
    () =>
      navigate('Accounts', {
        onSelect: (account) => navigate('Wallet', { account }),
      }),
    [navigate],
  );
};
