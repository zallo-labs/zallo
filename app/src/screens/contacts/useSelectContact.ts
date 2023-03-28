import { Contact } from '@api/contacts';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { EventEmitter } from '~/util/EventEmitter';
import { ContactsScreenParams } from './ContactsScreen';

export const CONTACT_EMITTER = new EventEmitter<Contact>('Contact');

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
