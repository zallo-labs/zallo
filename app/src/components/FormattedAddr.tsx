import { useMemo } from 'react';
import { ethers } from 'ethers';
import { elipseTruncate } from '@util/format';

export interface FormattedAddrProps {
  addr: string;
  full?: boolean;
}

export const FormattedAddr = ({ addr, full }: FormattedAddrProps) => {
  const formatted = useMemo(() => {
    if (!ethers.utils.isAddress(addr))
      throw new Error(`'${addr}' is not an address`);

    if (!full) addr = elipseTruncate(addr, 6, 4);

    return addr;
  }, [addr, full]);

  return <>{formatted}</>;
};
