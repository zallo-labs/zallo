import { useAddressEns } from '~/components/addr/useAddrEns';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { Contact } from '@api/contacts';
import { truncateAddr } from '~/util/format';

export interface ContactItemProps extends Partial<ListItemProps> {
  contact: Contact;
}

export const ContactItem = ({ contact, ...itemProps }: ContactItemProps) => (
  <ListItem
    leading={contact.name}
    headline={contact.name}
    supporting={truncateAddr(contact.addr)}
    trailing={useAddressEns(contact.addr) || undefined}
    {...itemProps}
  />
);
