import { useMemo } from 'react';
import { Address } from 'lib';
import { useAddrName } from './useAddrName';

export interface AddrProps {
  addr: Address;
  full?: boolean;
}

export const useFormattedAddr = ({ addr, full }: AddrProps) => {
  const name = useAddrName(addr);

  return useMemo(() => (full ? addr : name), [addr, full, name]);
};

export const Addr = (props: AddrProps) => <>{useFormattedAddr(props)}</>;
