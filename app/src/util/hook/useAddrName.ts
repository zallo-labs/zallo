import { Address } from 'lib';
import { useWallet } from '@features/wallet/useWallet';
import { useContacts } from '~/queries';
import { useSafe } from '@features/safe/SafeProvider';
import { useMemo } from 'react';
import { useToken } from '~/token/useToken';
import { elipseTruncate } from '@util/format';

export const truncatedAddr = (addr: Address) => elipseTruncate(addr, 6, 4);

export const useAddrName = (addr: Address) => {
  const wallet = useWallet();
  const { contacts } = useContacts();
  const { safe, name: safeName } = useSafe();
  const token = useToken(addr);

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [contacts, addr],
  );

  return useMemo(() => {
    if (wallet.address === addr) return 'Myself';
    if (addr === safe.address && safeName) return safeName;

    return contact?.name ?? token?.name ?? truncatedAddr(addr);
  }, [
    addr,
    contact?.name,
    safe.address,
    safeName,
    token?.name,
    wallet.address,
  ]);
};
