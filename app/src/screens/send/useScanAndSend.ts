import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { WalletId } from '~/queries/wallets';

export const useScanAndSend = (wallet: WalletId) => {
  const { navigate } = useRootNavigation();

  return useCallback(() => {
    navigate('Scan', {
      onScan: (link) =>
        navigate('Send', {
          wallet,
          to: link.target_address,
        }),
    });
  }, [navigate, wallet]);
};
