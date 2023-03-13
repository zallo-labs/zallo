import { Address } from 'lib';
import { useMemo } from 'react';
import { useContacts } from './useContacts';

export const useContact = (addr?: Address) => {
  const contacts = useContacts();

  return useMemo(
    () => (addr ? contacts.find((c) => c.addr === addr) : undefined),
    [contacts, addr],
  );
};
