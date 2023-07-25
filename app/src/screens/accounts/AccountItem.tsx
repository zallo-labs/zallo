import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { truncateAddr } from '~/util/format';

const FragmentDoc = gql(/* GraphQL */ `
  fragment AccountItem_AccountFragment on Account {
    id
    address
    name
  }
`);

export interface AccountItemProps extends Partial<ListItemProps> {
  account: FragmentType<typeof FragmentDoc>;
}

export function AccountItem(props: AccountItemProps) {
  const a = useFragment(FragmentDoc, props.account);

  return (
    <ListItem
      leading={a.address}
      headline={a.name}
      supporting={truncateAddr(a.address)}
      {...props}
    />
  );
}
