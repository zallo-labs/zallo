import { Address } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { useMemo } from 'react';
import { useMaybeToken } from '~/token/useToken';
import { useContacts } from '~/queries/useContacts.api';
import { truncatedAddr } from '@util/format';
import { useAddrEns } from './useAddrEns';

export const useAddrName = (addr: Address) => {
  const { contacts } = useContacts();
  const { safe, name: safeName } = useSafe();
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [contacts, addr],
  );

  return useMemo(
    () =>
      (addr === safe.address && safeName) ||
      contact?.name ||
      token?.name ||
      ens ||
      truncatedAddr(addr),
    [addr, contact?.name, ens, safe.address, safeName, token?.name],
  );
};
