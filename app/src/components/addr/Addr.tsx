import { Address } from 'lib';
import { useAddrName, UseAddrNameOptions } from './useAddrName';

export interface AddrProps extends UseAddrNameOptions {
  addr: Address;
}

export const Addr = ({ addr, ...options }: AddrProps) => (
  <>{useAddrName(addr, options)}</>
);
