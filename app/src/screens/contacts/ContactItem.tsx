import { Text } from 'react-native-paper';
import { useAddrName } from '~/components/addr/useAddrName';
import { Identicon } from '~/components/Identicon/Identicon';
import { Item, ItemProps } from '~/components/item/Item';
import { Contact } from '~/queries/contacts/useContacts.api';
import { truncateAddr } from '~/util/format';

export interface ContactItemProps extends ItemProps {
  contact: Contact;
}

export const ContactItem = ({ contact, ...itemProps }: ContactItemProps) => {
  const name = useAddrName(contact.addr);

  return (
    <Item
      Left={<Identicon seed={contact.addr} />}
      Main={[
        <Text variant="titleMedium">{contact.name}</Text>,
        name !== contact.name && <Text variant="bodyLarge">{name}</Text>,
      ]}
      Right={name && <Text variant="bodyMedium">{truncateAddr(contact.addr)}</Text>}
      padding
      {...itemProps}
    />
  );
};
