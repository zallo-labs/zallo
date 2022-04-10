import { useMemo } from 'react';
import { ethers } from 'ethers';

export interface FormattedAddressProps {
  addr: string;
}

export const FormattedAddr = ({ addr }: FormattedAddressProps) => {
  const formatted = useMemo(() => {
    if (!ethers.utils.isAddress(addr)) throw new Error(`'${addr}' is not an address`);

    return `${addr.slice(0, 6)}...${addr.slice(addr.length - 4)}`;
  }, [addr]);

  return <>{formatted}</>;
};
