import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';

export const useAddressLabel = <A extends Address | undefined>(address: A) => {
  const token = useMaybeToken(address);

  return useMemo(
    () => (!address ? undefined : token?.name || truncateAddr(address)),
    [address, token?.name],
  ) as A extends undefined ? string | undefined : string;
};

export interface AddressLabelProps {
  address: Address;
}

export const AddressLabel = ({ address }: AddressLabelProps) => <>{useAddressLabel(address)}</>;
