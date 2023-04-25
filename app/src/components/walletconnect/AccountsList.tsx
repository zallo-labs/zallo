import { AccountId, useAccountIds } from '@api/account';
import { Updater } from 'use-immer';
import { ListItem } from '../list/ListItem';
import { useAddressLabel } from '../address/AddressLabel';
import { Checkbox } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

export interface AccountsListProps {
  selected: Set<AccountId>;
  updateSelected: Updater<Set<AccountId>>;
}

export const AccountsList = ({ selected, updateSelected }: AccountsListProps) => {
  const accounts = useAccountIds();

  return (
    <View style={styles.container}>
      {accounts.map((account) => (
        <ListItem
          key={account}
          leading={account}
          headline={useAddressLabel(account)}
          trailing={
            <Checkbox
              status={selected.has(account) ? 'checked' : 'unchecked'}
              onPress={() =>
                updateSelected((draft) => {
                  draft.delete(account) || draft.add(account);
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
