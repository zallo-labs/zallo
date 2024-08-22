import { UAddress } from 'lib';
import { useLazyQuery } from '~/api';
import { graphql } from 'relay-runtime';
import { AddressLabelQuery } from '~/api/__generated__/AddressLabelQuery.graphql';
import { truncateAddr } from '~/util/format';
import { Text, TextProps } from 'react-native-paper';
import { useRouter } from 'expo-router';

const Query = graphql`
  query AddressLabelQuery($address: UAddress!) {
    label(address: $address)
  }
`;

export function useAddressLabel(address: UAddress) {
  const { label } = useLazyQuery<AddressLabelQuery>(
    Query,
    { address },
    { fetchPolicy: 'store-or-network' },
  );

  return label || truncateAddr(address);
}

export interface AddressLabelProps extends Omit<TextProps<string>, 'children'> {
  address: UAddress;
}

export function AddressLabel({ address, ...textProps }: AddressLabelProps) {
  const router = useRouter();

  return (
    <Text
      {...textProps}
      onPress={() => router.push({ pathname: `/address/[address]`, params: { address } })}
    >
      {useAddressLabel(address)}
    </Text>
  );
}
