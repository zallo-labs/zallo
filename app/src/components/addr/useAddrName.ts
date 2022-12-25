import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { useUser } from '~/queries/useUser.api';

export type AddrNameMode = 'default' | 'full-addr' | 'short-addr' | 'ens-or-short-addr';

export interface UseAddrNameOptions {
  mode?: AddrNameMode;
}

export const useAddrName = (addr: Address, { mode }: UseAddrNameOptions = {}) => {
  const user = useUser();
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
        return user?.name || token?.name || ens || truncateAddr(addr);
    }
  }, [addr, user?.name, ens, mode, token?.name]);
};
