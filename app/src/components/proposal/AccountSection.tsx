import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { AccountSection_account$key } from '~/api/__generated__/AccountSection_account.graphql';

const Account = graphql`
  fragment AccountSection_account on Account {
    id
    address
    name
  }
`;

export interface AccountSectionProps {
  account: AccountSection_account$key;
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
