import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { FragmentType, gql, useFragment } from '@api';
import { View } from 'react-native';

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
    <View>
      <ListHeader>Account</ListHeader>
      <ListItem
        leading={(props) => <AddressIcon address={account.address} {...props} />}
        leadingSize="medium"
        headline={account.name}
      />
    </View>
  );
}
