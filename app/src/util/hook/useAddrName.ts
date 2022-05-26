import { Address } from 'lib';
import { useWallet } from '@features/wallet/useWallet';
import { useContacts } from '@queries';
import { useSafe } from '@features/safe/SafeProvider';
import { useMemo } from 'react';

export const useAddrName = (addr: Address) => {
  const wallet = useWallet();
  const { contacts } = useContacts();
  const { safe, name: safeName } = useSafe();

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [contacts, addr],
  );

  return wallet.address === addr
    ? 'Myself'
    : addr === safe.address
    ? safeName
    : contact?.name;
};
