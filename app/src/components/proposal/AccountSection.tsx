import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { FragmentType, gql, useFragment } from '@api';

const Account = gql(/* GraphQL */ `
  fragment AccountSection_Account on Account {
    id
    address
    name
  }
`);

export interface AccountSectionProps {
  account: FragmentType<typeof Account>;
}

export function AccountSection(props: AccountSectionProps) {
  const account = useFragment(Account, props.account);

  return (
    <>
      <ListHeader>Account</ListHeader>
      <ListItem leading={<AddressIcon address={account.address} />} headline={account.name} />
    </>
  );
}
