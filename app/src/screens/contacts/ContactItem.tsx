import { useAddrName } from '~/components/addr/useAddrName';
import { ListItem, ListItemProps } from '~/components/ListItem/ListItem';
import { Contact } from '~/queries/contacts/useContacts.api';
import { truncateAddr } from '~/util/format';

export interface ContactItemProps extends Partial<ListItemProps> {
  contact: Contact;
}

export const ContactItem = ({ contact, ...itemProps }: ContactItemProps) => {
  const name = useAddrName(contact.addr);

  return (
    <ListItem
      leading={contact.name}
      headline={contact.name}
      supporting={name !== contact.name ? name : undefined}
      trailing={truncateAddr(contact.addr)}
      {...itemProps}
    />
  );
};
