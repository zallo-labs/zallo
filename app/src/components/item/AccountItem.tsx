import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { truncateAddr } from '~/util/format';

const Account = gql(/* GraphQL */ `
  fragment AccountItem_Account on Account {
    id
    address
    name
  }
`);

export interface AccountItemProps extends Partial<ListItemProps> {
  account: FragmentType<typeof Account>;
}

export function AccountItem(props: AccountItemProps) {
  const a = useFragment(Account, props.account);

  return (
    <ListItem
      leading={a.address}
      headline={a.name}
      supporting={truncateAddr(a.address)}
      {...props}
    />
  );
}
