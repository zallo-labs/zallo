import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncatedAddr } from '~/util/format';
import { useAddrEns } from './useAddrEns';
import { useContact } from '~/queries/contacts/useContact';

export const useAddrName = (addr: Address) => {
  const contact = useContact(addr);
  const token = useMaybeToken(addr);
  const ens = useAddrEns(addr);

  return useMemo(
    () => contact?.name || token?.name || ens || truncatedAddr(addr),
    [addr, contact?.name, ens, token?.name],
  );
};
