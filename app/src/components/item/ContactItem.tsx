import { NavigateNextIcon } from '@theme/icons';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { forwardRef } from 'react';
import { View } from 'react-native-reanimated/lib/typescript/Animated';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { ContactItem_contact$key } from '~/api/__generated__/ContactItem_contact.graphql';

const Contact = graphql`
  fragment ContactItem_contact on Contact {
    id
    address
    name
  }
`;

export interface ContactItemProps extends Partial<ListItemProps> {
  contact: ContactItem_contact$key;
}

export const ContactItem = forwardRef<View, ContactItemProps>((props, ref) => {
  const c = useFragment(Contact, props.contact);

  return (
    <ListItem
      ref={ref}
      leading={<AddressIcon address={c.address} />}
      leadingSize="medium"
      headline={c.name}
      supporting={truncateAddr(c.address)}
      trailing={NavigateNextIcon}
      {...props}
    />
  );
});
