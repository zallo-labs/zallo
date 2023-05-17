import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useUser } from '@api/user';

export interface UseAddressLabelOptions {
  ignoreName?: boolean;
}

export const useAddressLabel = <A extends Address | undefined>(
  address: A,
  { ignoreName }: UseAddressLabelOptions = {},
) => {
  const user = useUser(address);
  const token = useMaybeToken(address);

  return useMemo(
    () =>
      !address ? undefined : (!ignoreName && user?.name) || token?.name || truncateAddr(address),
    [address, user?.name, token?.name],
  ) as A extends undefined ? string | undefined : string;
};

export interface AddressLabelProps {
  address: Address;
}

export const AddressLabel = ({ address }: AddressLabelProps) => <>{useAddressLabel(address)}</>;
