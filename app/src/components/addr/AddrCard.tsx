import { truncateAddr } from '~/util/format';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { Identicon } from '~/components/Identicon/Identicon';
import { Address } from 'lib';
import { useContact } from '~/queries/contacts/useContact';
import { memo } from 'react';

export interface AddrCardProps extends CardItemProps {
  addr: Address;
}

export const AddrCard = memo(({ addr, ...itemProps }: AddrCardProps) => {
  const contact = useContact(addr);

  const truncatedAddr = truncateAddr(addr);

  return (
    <CardItem
      Left={<Identicon seed={addr} />}
      Main={<Text variant="titleMedium">{contact?.name ?? truncatedAddr}</Text>}
      {...(contact && {
        Right: <Text variant="bodyMedium">{truncatedAddr}</Text>,
      })}
      {...itemProps}
    />
  );
});
