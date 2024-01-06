import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { truncateAddr } from '~/util/format';
import { NavigateNextIcon } from '~/util/theme/icons';

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
      leadingSize="medium"
      headline={c.label}
      supporting={truncateAddr(c.address)}
      trailing={NavigateNextIcon}
      {...props}
    />
  );
}
