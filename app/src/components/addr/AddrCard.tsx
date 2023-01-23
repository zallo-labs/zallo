import { truncateAddr } from '~/util/format';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { Address } from 'lib';
import { memo } from 'react';
import { useAddrName } from './useAddrName';
import { AddrIcon } from '../Identicon/AddrIcon';

export interface AddrCardProps extends CardItemProps {
  addr: Address;
}

export const AddrCard = memo(({ addr, ...itemProps }: AddrCardProps) => {
  const name = useAddrName(addr);
  const truncatedAddr = truncateAddr(addr);

  return (
    <CardItem
      Left={<AddrIcon addr={addr} />}
      Main={<Text variant="titleMedium">{name ?? truncatedAddr}</Text>}
      {...(name && {
        Right: <Text variant="bodyMedium">{truncatedAddr}</Text>,
      })}
      {...itemProps}
    />
  );
});
