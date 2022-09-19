import { UserId } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useSendToContact = (user: UserId) => {
  const { navigate } = useRootNavigation();

  return useCallback(() => {
    navigate('Contacts', {
      onSelect: (contact) =>
        navigate('Send', {
          user,
          to: contact.addr,
        }),
    });
  }, [navigate, user]);
};
