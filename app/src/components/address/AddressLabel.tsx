import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { useEns } from './useEns';
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
  const ens = useEns(address);

  return useMemo(
    () =>
      !address
        ? undefined
        : (!ignoreName && user?.name) || token?.name || ens || truncateAddr(address),
    [address, user?.name, ens, token?.name],
  ) as A extends undefined ? string | undefined : string;
};

export interface AddressLabelProps {
  address: Address;
}

export const AddressLabel = ({ address }: AddressLabelProps) => <>{useAddressLabel(address)}</>;
