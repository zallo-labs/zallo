import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { graphql } from 'relay-runtime';
import { AccountItem_account$key } from '~/api/__generated__/AccountItem_account.graphql';
import { useFragment } from 'react-relay';

const Account = graphql`
  fragment AccountItem_account on Account {
    id
    address
    name
  }
`;

export interface AccountItemProps extends Partial<ListItemProps> {
  account: AccountItem_account$key;
}

export function AccountItem(props: AccountItemProps) {
  const a = useFragment(Account, props.account);

  return (
    <ListItem
      leading={<AddressIcon address={a.address} />}
      headline={a.name}
      supporting={truncateAddr(a.address)}
      {...props}
    />
  );
}
