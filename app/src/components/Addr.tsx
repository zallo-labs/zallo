import { useMemo } from 'react';
import { Address } from 'lib';
import { useAddrName } from '@util/hook/useAddrName';

export interface AddrProps {
  addr: Address;
  full?: boolean;
}

export const useFormattedAddr = ({ addr, full }: AddrProps) => {
  const name = useAddrName(addr);

  const formatted = useMemo(() => (full ? addr : name), [addr, full, name]);

  return formatted;
};

export const Addr = (props: AddrProps) => <>{useFormattedAddr(props)}</>;
