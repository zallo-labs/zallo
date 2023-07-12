import { FragmentType, gql, useFragment } from '@api/gen';
import { ListItem, ListItemProps } from '~/components/list/ListItem';

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

  return <ListItem leading={a.address} headline={a.name} {...props} />;
}
