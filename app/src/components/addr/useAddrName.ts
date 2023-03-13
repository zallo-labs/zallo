import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { useUser } from '@api/user';

export const useAddrName = <Addr extends Address | undefined>(addr: Addr) => {
  const user = useUser(addr);
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  return useMemo(
    () => (!addr ? undefined : user?.name || token?.name || ens || truncateAddr(addr)),
    [addr, user?.name, ens, token?.name],
  ) as Addr extends undefined ? string | undefined : string;
};
