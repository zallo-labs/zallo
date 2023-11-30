import { UAddress } from 'lib';
import { truncateAddr } from '~/util/format';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query AddressLabel($address: UAddress!) {
    label(input: { address: $address })
  }
`);

export const useAddressLabel = <A extends UAddress | undefined>(address: A) => {
  const label = useQuery(Query, { address: address! }, { pause: !address }).data?.label;

  return (address ? label || truncateAddr(address) : undefined) as A extends undefined
    ? string | undefined
    : string;
};

export interface AddressLabelProps {
  address: UAddress;
}

export const AddressLabel = ({ address }: AddressLabelProps) => useAddressLabel(address);
