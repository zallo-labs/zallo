import { Address } from 'lib';
import { useAddressLabel } from './useAddrName';

export interface AddressLabelProps {
  address: Address;
}

export const AddressLabel = ({ address }: AddressLabelProps) => <>{useAddressLabel(address)}</>;
