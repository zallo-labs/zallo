import { truncateAddr } from '~/util/format';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { Address } from 'lib';
import { memo } from 'react';
import { useAddressLabel } from './AddressLabel';
import { AddressIcon } from '../Identicon/AddressIcon';

export interface AddrCardProps extends CardItemProps {
  addr: Address;
}

export const AddrCard = memo(({ addr, ...itemProps }: AddrCardProps) => {
  const name = useAddressLabel(addr);
  const truncatedAddr = truncateAddr(addr);

  return (
    <CardItem
      Left={<AddressIcon addr={addr} />}
      Main={<Text variant="titleMedium">{name ?? truncatedAddr}</Text>}
      {...(name && {
        Right: <Text variant="bodyMedium">{truncatedAddr}</Text>,
      })}
      {...itemProps}
    />
  );
});
