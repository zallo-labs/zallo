import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useAddressEns } from './useAddrEns';
import { useUser } from '@api/user';

export const useAddressLabel = <A extends Address | undefined>(address: A) => {
  const user = useUser(address);
  const token = useMaybeToken(address);
  const ens = useAddressEns(address);

  return useMemo(
    () => (!address ? undefined : user?.name || token?.name || ens || truncateAddr(address)),
    [address, user?.name, ens, token?.name],
  ) as A extends undefined ? string | undefined : string;
};
