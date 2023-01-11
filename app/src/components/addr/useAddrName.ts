import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { useUser } from '~/queries/useUser.api';

export const useAddrName = (addr: Address) => {
  const user = useUser(addr);
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  return useMemo(
    () => user?.name || token?.name || ens || truncateAddr(addr),
    [addr, user?.name, ens, token?.name],
  );
};
