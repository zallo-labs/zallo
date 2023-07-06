import { Address } from 'lib';

export interface Contact {
  id: string;
  address: Address;
  label: string;
}

export type NewContact = Omit<Contact, 'id'>;
