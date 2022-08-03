import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useNavigation } from '@react-navigation/native';
import { MenuIcon, PlusIcon } from '@util/theme/icons';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AccountCard } from '~/components2/account/AccountCard';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { useAccounts } from '~/queries/accounts/useAccounts';

export const AccountsScreen = withSkeleton(() => {
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const { AppbarHeader, scrollHandler } = useAppbarHeader();
  const { accounts } = useAccounts();

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <Appbar.Action icon={MenuIcon} onPress={() => alert('Unimplemented')} />

        <Appbar.Content title="Accounts" />

        <Appbar.Action icon={PlusIcon} onPress={() => navigate('CreateFirstAccount')} />
      </AppbarHeader>

      <Box m={3}>
        <FlatList
          data={accounts}
          keyExtractor={(account) => account.id}
          renderItem={({ item: account }) => (
            <AccountCard
              account={account}
              onPress={() => navigate('Account', { account })}
            />
          )}
          onScroll={scrollHandler}
        />
      </Box>
    </Box>
  );
}, ListScreenSkeleton);
