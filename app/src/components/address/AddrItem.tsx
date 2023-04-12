import { Address } from 'lib';
import { memo, ReactNode } from 'react';
import { Text } from 'react-native-paper';
import { truncateAddr } from '~/util/format';
import { AddressIcon } from '../Identicon/AddressIcon';
import { Item, ItemProps } from '../item/Item';
import { useAddressLabel } from './AddressLabel';

export interface AddrItemProps extends ItemProps {
  addr: Address;
  secondary?: ReactNode;
}

export const AddrItem = memo(({ addr, secondary, ...itemProps }: AddrItemProps) => {
  const name = useAddressLabel(addr);
  const truncatedAddr = truncateAddr(addr);

  return (
    <Item
      Left={<AddressIcon address={addr} />}
      Main={[<Text variant="titleMedium">{name ?? truncatedAddr}</Text>, secondary]}
      Right={name && <Text variant="bodyMedium">{truncatedAddr}</Text>}
      padding
      {...itemProps}
    />
  );
});
