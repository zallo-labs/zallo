import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '~/token/useToken';
import { useContacts } from '~/queries/contacts/useContacts.api';
import { truncatedAddr } from '@util/format';
import { useAddrEns } from './useAddrEns';

export const useAddrName = (addr: Address) => {
  const { contacts } = useContacts();
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [contacts, addr],
  );

  return useMemo(
    () => contact?.name || token?.name || ens || truncatedAddr(addr),
    [addr, contact?.name, ens, token?.name],
  );
};
