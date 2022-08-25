import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { WalletId } from '~/queries/wallets';

export const useSendToContact = (wallet: WalletId) => {
  const { navigate } = useRootNavigation();

  return useCallback(() => {
    navigate('Contacts', {
      onSelect: (contact) =>
        navigate('Send', {
          wallet,
          to: contact.addr,
        }),
    });
  }, [navigate, wallet]);
};
