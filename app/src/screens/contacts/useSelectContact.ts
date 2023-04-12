import { EventEmitter } from '~/util/EventEmitter';
import { Contact } from '@api/contacts';

export const CONTACT_EMITTER = new EventEmitter<Contact>('Contact');
export const useSelectContact = CONTACT_EMITTER.createUseSelect('ContactsModal', {
  emitOnSelect: true,
});
