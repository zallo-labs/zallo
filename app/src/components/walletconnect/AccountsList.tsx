import { Updater } from 'use-immer';
import { ListItem } from '../list/ListItem';
import { Checkbox } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Address } from 'lib';
import { FragmentType, gql, useFragment } from '@api/generated';

const Account = gql(/* GraphQL */ `
  fragment AccountsList_Account on Account {
    id
    address
    name
  }
`);

export interface AccountsListProps {
  accounts: FragmentType<typeof Account>[];
  selected: Set<Address>;
  updateSelected: Updater<Set<Address>>;
}

export const AccountsList = ({ selected, updateSelected, ...props }: AccountsListProps) => {
  const accounts = useFragment(Account, props.accounts);

  return (
    <View style={styles.container}>
      {accounts.map((account) => (
        <ListItem
          key={account.id}
          leading={account.address}
          headline={account.name}
          trailing={
            <Checkbox
              status={selected.has(account.address) ? 'checked' : 'unchecked'}
              onPress={() =>
                updateSelected((draft) => {
                  draft.delete(account.address) || draft.add(account.address);
                })
              }
            />
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
