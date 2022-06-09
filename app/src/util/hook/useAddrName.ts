import { Address } from 'lib';
import { useWallet } from '@features/wallet/useWallet';
import { useContacts } from '~/queries';
import { useSafe } from '@features/safe/SafeProvider';
import { useMemo } from 'react';
import { useToken } from '~/token/useToken';
import { elipseTruncate } from '@util/format';

export const useAddrName = (addr: Address) => {
  const wallet = useWallet();
  const { contacts } = useContacts();
  const { safe, name: safeName } = useSafe();
  const token = useToken(addr);

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [contacts, addr],
  );

  return wallet.address === addr
    ? 'Myself'
    : addr === safe.address && safeName
    ? safeName
    : contact?.name ?? token?.name ?? elipseTruncate(addr, 6, 4);
};
