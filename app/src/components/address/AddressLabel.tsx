import { UAddress } from 'lib';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { AddressLabelQuery } from '~/api/__generated__/AddressLabelQuery.graphql';
import { truncateAddr } from '~/util/format';

const Query = graphql`
  query AddressLabelQuery($address: UAddress!, $skip: Boolean!) {
    label(input: { address: $address }) @skip(if: $skip)
  }
`;

export const useAddressLabel = <A extends UAddress | undefined>(address: A) => {
  const { label } = useLazyLoadQuery<AddressLabelQuery>(Query, {
    address: address!,
    skip: !address,
  });

  return (address ? label || truncateAddr(address) : undefined) as A extends undefined
    ? string | undefined
    : string;
};

export interface AddressLabelProps {
  address: UAddress;
}

export const AddressLabel = ({ address }: AddressLabelProps) => useAddressLabel(address);
