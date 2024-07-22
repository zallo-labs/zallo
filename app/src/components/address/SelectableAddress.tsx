import { UAddress } from 'lib';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { SelectableAddressQuery } from '~/api/__generated__/SelectableAddressQuery.graphql';
import { truncateAddr } from '~/util/format';

const Query = graphql`
  query SelectableAddressQuery($address: UAddress!) {
    label(address: $address)
  }
`;

export interface SelectableAddressProps {
  address: UAddress;
}

export function SelectableAddress({ address }: SelectableAddressProps) {
  const query = useLazyQuery<SelectableAddressQuery>(Query, { address });

  const label = query.label || truncateAddr(address);

  return <>{label}</>;
}
