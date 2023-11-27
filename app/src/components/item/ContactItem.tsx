import { FragmentType, gql, useFragment } from '@api/generated';
import { NavigateNextIcon } from '@theme/icons';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { truncateAddr } from '~/util/format';

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

export function ContactItem(props: ContactItemProps) {
  const c = useFragment(Contact, props.contact);

  return (
    <ListItem
      leading={(props) => <AddressIcon address={c.address} {...props} />}
      headline={c.label}
      supporting={truncateAddr(c.address)}
      trailing={NavigateNextIcon}
      {...props}
    />
  );
}
