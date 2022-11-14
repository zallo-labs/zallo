import { Address } from 'lib';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { truncateAddr } from '~/util/format';
import { Identicon } from '../Identicon/Identicon';
import { Item, ItemProps } from '../item/Item';
import { useAddrName } from './useAddrName';

export interface AddrItemProps extends ItemProps {
  addr: Address;
}

export const AddrItem = memo(({ addr, ...itemProps }: AddrItemProps) => {
  const name = useAddrName(addr);
  const truncatedAddr = truncateAddr(addr);

  return (
    <Item
      Left={<Identicon seed={addr} />}
      Main={<Text variant="titleMedium">{name ?? truncatedAddr}</Text>}
      Right={name && <Text variant="bodyMedium">{truncatedAddr}</Text>}
      padding
      {...itemProps}
    />
  );
});
