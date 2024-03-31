import { Updater } from 'use-immer';
import { ListItem } from '../list/ListItem';
import { Checkbox } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { UAddress } from 'lib';
import { FragmentType, gql, useFragment } from '@api/generated';
import { AddressIcon } from '../Identicon/AddressIcon';
import { ListHeader } from '../list/ListHeader';

const Account = gql(/* GraphQL */ `
  fragment AccountsList_Account on Account {
    id
    address
    name
  }
`);

export interface AccountsListProps {
  accounts: FragmentType<typeof Account>[];
  selected: Set<UAddress>;
  updateSelected: Updater<Set<UAddress>>;
}

export const AccountsList = ({ selected, updateSelected, ...props }: AccountsListProps) => {
  const accounts = useFragment(Account, props.accounts);

  const allStatus =
    selected.size === accounts.length
      ? 'checked'
      : selected.size === 0
        ? 'unchecked'
        : 'indeterminate';

  return (
    <View style={styles.container}>
      <ListHeader
        trailing={
          <Checkbox
            status={allStatus}
            onPress={() =>
              updateSelected((selected) => {
                if (allStatus === 'checked') {
                  selected.clear();
                } else {
                  // unchecked | indeterminate
                  accounts.forEach((account) => selected.add(account.address));
                }
              })
            }
          />
        }
      >
        Accounts
      </ListHeader>

      {accounts.map((account) => (
        <ListItem
          key={account.id}
          leading={<AddressIcon address={account.address} />}
          headline={account.name}
          trailing={<Checkbox status={selected.has(account.address) ? 'checked' : 'unchecked'} />}
          onPress={() =>
            updateSelected((draft) => {
              draft.delete(account.address) || draft.add(account.address);
            })
          }
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});
