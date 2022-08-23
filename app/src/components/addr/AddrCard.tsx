import { elipseTruncate } from '~/util/format';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { useContacts } from '~/queries/contacts/useContacts.api';
import { CardItem, CardItemProps } from '../card/CardItem';
import { Identicon } from '~/components/Identicon/Identicon';
import { Address } from 'lib';

export interface AddrCardProps extends CardItemProps {
  addr: Address;
}

export const AddrCard = ({ addr, ...itemProps }: AddrCardProps) => {
  const { contacts } = useContacts();

  const contact = useMemo(
    () => contacts.find((c) => c.addr === addr),
    [addr, contacts],
  );

  const truncatedAddr = useMemo(() => elipseTruncate(addr, 6, 4), [addr]);

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
};
