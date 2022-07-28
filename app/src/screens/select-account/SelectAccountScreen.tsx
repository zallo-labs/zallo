import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AccountCard } from '~/components2/account/AccountCard';
import { useSetSelectedAccount } from '~/components2/account/useSelectedAccount';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccounts } from '~/queries/safe/useAccounts';

export type SelectAccountScreenProps =
  RootNavigatorScreenProps<'SelectAccount'>;

export const SelectAccountScreen = ({
  navigation,
}: SelectAccountScreenProps) => {
  const { accounts } = useAccounts();
  const setSelected = useSetSelectedAccount();

  return (
    <Box>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="Select Account" />
      </Appbar.Header>

      <Box m={3}>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              cardProps={{
                onPress: () => {
                  setSelected(item);
                  navigation.goBack();
                },
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
};
