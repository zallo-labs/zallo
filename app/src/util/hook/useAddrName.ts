import { Address } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { useMemo } from 'react';
import { useToken } from '~/token/useToken';
import { useContacts } from '~/queries/useContacts';
import { truncatedAddr } from '@util/format';

export const useAddrName = (addr: Address) => {
  const { contacts } = useContacts();
  const { safe, name: safeName } = useSafe();
  const token = useToken(addr);

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [contacts, addr],
  );

  return useMemo(() => {
    if (addr === safe.address && safeName) return safeName;

    return contact?.name || token?.name || truncatedAddr(addr);
  }, [addr, contact?.name, safe.address, safeName, token?.name]);
};
