import { Address } from 'lib';
import { useMemo } from 'react';
import { useMaybeToken } from '@token/useToken';
import { truncateAddr } from '~/util/format';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { AddressLabelQuery, AddressLabelQueryVariables } from '@api/gen/graphql';
import { AddressLabelDocument } from '@api/generated';

gql(/* GraphQL */ `
  query AddressLabel($address: Address!) {
    label(input: { address: $address })
  }
`);

export const useAddressLabel = <A extends Address | undefined>(address: A) => {
  const token = useMaybeToken(address);
  const label = useSuspenseQuery<AddressLabelQuery, AddressLabelQueryVariables>(
    AddressLabelDocument,
    {
      variables: { address: address! },
      skip: !address,
    },
  ).data?.label;

  return useMemo(
    () => (!address ? undefined : label || token?.name || truncateAddr(address)),
    [label, address, token?.name],
  ) as A extends undefined ? string | undefined : string;
};

export interface AddressLabelProps {
  address: Address;
}

export const AddressLabel = ({ address }: AddressLabelProps) => <>{useAddressLabel(address)}</>;
