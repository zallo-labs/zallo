import { Address } from 'lib';
import { useAddrName } from './useAddrName';

export interface AddrProps {
  addr: Address;
}

export const Addr = ({ addr }: AddrProps) => <>{useAddrName(addr)}</>;
