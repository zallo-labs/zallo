import { Updater } from 'use-immer';
import { ListItem } from '../list/ListItem';
import { Checkbox } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { UAddress, asChain } from 'lib';
import { FragmentType, gql, useFragment } from '@api/generated';
import { Chain } from 'chains';

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
  chains: Chain[];
}

export const AccountsList = ({ selected, updateSelected, chains, ...props }: AccountsListProps) => {
  const accounts = useFragment(Account, props.accounts);

  return (
    <View style={styles.container}>
      {accounts
        .filter((account) => chains.includes(asChain(account.address)))
        .map((account) => (
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
