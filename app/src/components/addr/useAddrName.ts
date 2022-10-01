import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { useContact } from '~/queries/contacts/useContact';

export type AddrNameMode =
  | 'default'
  | 'full-addr'
  | 'short-addr'
  | 'ens-or-short-addr';

export const useAddrName = (addr: Address, mode?: AddrNameMode) => {
  const contact = useContact(addr);
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  return useMemo(() => {
    switch (mode) {
      case 'full-addr':
        return addr;
      case 'short-addr':
        return truncateAddr(addr);
      case 'ens-or-short-addr':
        return ens || truncateAddr(addr);
      case 'default':
      default:
        return contact?.name || token?.name || ens || truncateAddr(addr);
    }
  }, [addr, contact?.name, ens, mode, token?.name]);
};
