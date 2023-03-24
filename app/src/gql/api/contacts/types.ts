import { Address } from 'lib';

export interface Contact {
  id: string;
  address: Address;
  name: string;
}

export type NewContact = Omit<Contact, 'id'>;
