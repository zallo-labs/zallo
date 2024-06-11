import { FragmentType, gql, useFragment } from '@api/generated';
import { NavigateNextIcon } from '@theme/icons';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { forwardRef } from 'react';
import { View } from 'react-native-reanimated/lib/typescript/Animated';

const Contact = gql(/* GraphQL */ `
  fragment ContactItem_Contact on Contact {
    id
    address
    label
  }
`);

export interface ContactItemProps extends Partial<ListItemProps> {
  contact: FragmentType<typeof Contact>;
}

export const ContactItem = forwardRef<View, ContactItemProps>((props, ref) => {
  const c = useFragment(Contact, props.contact);

  return (
    <ListItem
      ref={ref}
      leading={<AddressIcon address={c.address} />}
      leadingSize="medium"
      headline={c.label}
      supporting={truncateAddr(c.address)}
      trailing={NavigateNextIcon}
      {...props}
    />
  );
});
