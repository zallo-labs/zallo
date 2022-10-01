import { Address } from 'lib';
import { AddrNameMode, useAddrName } from './useAddrName';

export interface AddrProps {
  addr: Address;
  mode?: AddrNameMode;
}

export const Addr = ({ addr, mode }: AddrProps) => (
  <>{useAddrName(addr, mode)}</>
);
