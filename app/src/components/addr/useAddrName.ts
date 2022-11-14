import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { CombinedAccount } from '~/queries/account/useAccount.api';
import { useDeviceMeta } from '~/queries/useDeviceMeta.api';

export type AddrNameMode = 'default' | 'full-addr' | 'short-addr' | 'ens-or-short-addr';

export interface UseAddrNameOptions {
  mode?: AddrNameMode;
  account?: CombinedAccount;
}

export const useAddrName = (addr: Address, { mode, account }: UseAddrNameOptions = {}) => {
  const device = useDeviceMeta(addr);
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  const user = useMemo(() => account?.users.find((u) => u.addr === addr), [account?.users, addr]);

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
        return user?.name || device?.name || token?.name || ens || truncateAddr(addr);
    }
  }, [addr, device?.name, ens, mode, token?.name, user?.name]);
};
