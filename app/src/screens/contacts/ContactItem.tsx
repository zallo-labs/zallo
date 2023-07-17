import { FragmentType, gql, useFragment } from '@api/gen';
import { NavigateNextIcon } from '@theme/icons';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { truncateAddr } from '~/util/format';

const ContactFragmentDoc = gql(/* GraphQL */ `
  fragment ContactItem_ContactFragment on Contact {
    id
    address
    label
  }
`);

export interface ContactItemProps extends Partial<ListItemProps> {
  contact: FragmentType<typeof ContactFragmentDoc>;
}

export function ContactItem(props: ContactItemProps) {
  const c = useFragment(ContactFragmentDoc, props.contact);

  return (
    <ListItem
      leading={c.address}
      headline={c.label}
      supporting={truncateAddr(c.address)}
      trailing={NavigateNextIcon}
      {...props}
    />
  );
}
