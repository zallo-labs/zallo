import { FC, useMemo } from 'react';

import { ethers } from '@ethers';

const formatAddress = (addr: string) => {
  if (!ethers.utils.isAddress(addr)) throw new Error(`'${addr}' is not an address`);

  return `${addr.slice(0, 6)}...${addr.slice(addr.length - 4)}`;
};

export interface FormattedAddressProps {
  addr: string;
  children: FC<{ addr: string }>;
}

export const FormattedAddr = ({ addr, children: Child }: FormattedAddressProps) => {
  const formatted = useMemo(() => formatAddress(addr), [addr]);

  return <Child addr={formatted} />;
};
