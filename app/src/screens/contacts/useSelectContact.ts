import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ContactsScreenParams, CONTACT_EMITTER } from './ContactsScreen';

export const useSelectContact = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: Omit<ContactsScreenParams, 'emitOnSelect'>) => {
      const p = CONTACT_EMITTER.getEvent();
      navigate('ContactsModal', {
        ...params,
        emitOnSelect: true,
      });

      return p;
    },
    [navigate],
  );
};
