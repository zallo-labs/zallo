import { truncateAddr } from '~/util/format';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { Identicon } from '~/components/Identicon/Identicon';
import { Address } from 'lib';
import { memo } from 'react';
import { useAddrName } from './useAddrName';

export interface AddrCardProps extends CardItemProps {
  addr: Address;
}

export const AddrCard = memo(({ addr, ...itemProps }: AddrCardProps) => {
  const name = useAddrName(addr);
  const truncatedAddr = truncateAddr(addr);

  return (
    <CardItem
      Left={<Identicon seed={addr} />}
      Main={<Text variant="titleMedium">{name ?? truncatedAddr}</Text>}
      {...(name && {
        Right: <Text variant="bodyMedium">{truncatedAddr}</Text>,
      })}
      {...itemProps}
    />
  );
});
