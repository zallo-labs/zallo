import { UserId } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useSendToScanned = (user: UserId) => {
  const { navigate } = useRootNavigation();

  return useCallback(() => {
    navigate('Scan', {
      onScanAddr: (link) =>
        navigate('Send', {
          user,
          to: link.target_address,
        }),
    });
  }, [navigate, user]);
};
