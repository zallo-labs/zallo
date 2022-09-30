import { Address } from 'lib';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { useContact } from '~/queries/contacts/useContact';
import { truncateAddr } from '~/util/format';
import { Identicon } from '../Identicon/Identicon';
import { Item, ItemProps } from '../item/Item';

export interface AddrItemProps extends ItemProps {
  addr: Address;
}

export const AddrItem = memo(({ addr, ...itemProps }: AddrItemProps) => {
  const contact = useContact(addr);

  const truncatedAddr = truncateAddr(addr);

  return (
    <Item
      Left={<Identicon seed={addr} />}
      Main={<Text variant="titleMedium">{contact?.name ?? truncatedAddr}</Text>}
      Right={contact && <Text variant="bodyMedium">{truncatedAddr}</Text>}
      padding
      {...itemProps}
    />
  );
});
