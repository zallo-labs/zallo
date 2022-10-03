import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { useContact } from '~/queries/contacts/useContact';
import { CombinedAccount } from '~/queries/account/useAccount.api';

export type AddrNameMode =
  | 'default'
  | 'full-addr'
  | 'short-addr'
  | 'ens-or-short-addr';

export interface UseAddrNameOptions {
  mode?: AddrNameMode;
  account?: CombinedAccount;
}

export const useAddrName = (
  addr: Address,
  { mode, account }: UseAddrNameOptions,
) => {
  const contact = useContact(addr);
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);
  const userName = useMemo(
    () => account?.users.find((u) => u.addr === addr)?.name,
    [account?.users, addr],
  );

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
        return (
          contact?.name || token?.name || userName || ens || truncateAddr(addr)
        );
    }
  }, [addr, contact?.name, ens, mode, token?.name, userName]);
};
