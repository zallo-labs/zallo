import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AccountCard } from '~/components2/account/AccountCard';
import { useSelectAccount } from '~/components2/account/useSelectedAccount';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccounts } from '~/queries/accounts/useAccounts';

export type SelectAccountScreenProps =
  RootNavigatorScreenProps<'SelectAccount'>;

export const SelectAccountScreen = ({
  navigation,
}: SelectAccountScreenProps) => {
  const { accounts } = useAccounts();
  const { AppbarHeader, scrollHandler } = useAppbarHeader();
  const setSelected = useSelectAccount();

  return (
    <Box>
      <AppbarHeader>
        <AppbarBack />
        <Appbar.Content title="Select Account" />
      </AppbarHeader>

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
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </Box>
  );
};
