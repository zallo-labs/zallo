import { Address } from 'lib';
import { truncateAddr } from '~/util/format';
import { gql } from '@api/gen';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query AddressLabel($address: Address!) {
    label(input: { address: $address })
  }
`);

export const useAddressLabel = <A extends Address | undefined>(address: A) => {
  const label = useQuery(Query, { address: address! }, { pause: !address }).data?.label;

  return (address ? label || truncateAddr(address) : undefined) as A extends undefined
    ? string | undefined
    : string;
};

export interface AddressLabelProps {
  address: Address;
}

export const AddressLabel = ({ address }: AddressLabelProps) => <>{useAddressLabel(address)}</>;
