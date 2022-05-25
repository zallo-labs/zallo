import { useMemo } from 'react';
import { ethers } from 'ethers';
import { elipseTruncate } from '@util/format';
import { Address } from 'lib';
import { useAddrName } from '@util/hook/useAddrName';

export interface FormattedAddrProps {
  addr: Address;
  full?: boolean;
}

export const FormattedAddr = ({ addr, full }: FormattedAddrProps) => {
  const name = useAddrName(addr);

  const formatted = useMemo(() => {
    let value: string = addr;
    if (!ethers.utils.isAddress(value))
      throw new Error(`'${value}' is not an address`);

    if (!full) {
      if (name) return name;
      value = elipseTruncate(value, 6, 4);
    }

    return value;
  }, [addr, full, name]);

  return <>{formatted}</>;
};
