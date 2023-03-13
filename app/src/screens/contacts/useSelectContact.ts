import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Contact } from '@api/contacts';
import { ContactsScreenParams } from './ContactsScreen';

export const useSelectContact = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: Omit<ContactsScreenParams, 'onSelect'>) =>
      new Promise<Contact>((resolve) =>
        navigate('ContactsModal', {
          ...params,
          onSelect: resolve,
        }),
      ),
    [navigate],
  );
};
