import { Address } from 'lib';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { ListItem } from '~/components/list/ListItem';
import { truncateAddr } from '~/util/format';

export interface ApproverItemProps {
  address: Address;
}

export function ApproverItem({ address }: ApproverItemProps) {
  const label = useAddressLabel(address);
  const truncated = truncateAddr(address);

  return (
    <ListItem
      leading={address}
      headline={label}
      trailing={label !== truncated ? truncated : undefined}
    />
  );
}
