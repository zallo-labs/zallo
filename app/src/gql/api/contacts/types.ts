import { Address } from 'lib';

export interface Contact {
  id: string;
  addr: Address;
  name: string;
}

export type NewContact = Omit<Contact, 'id'>;
