import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useNavigation } from '@react-navigation/native';
import { MenuIcon, PlusIcon } from '@util/theme/icons';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { useWalletIds } from '~/queries/wallets/useWalletIds';

export const WalletsScreen = withSkeleton(() => {
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const { walletIds } = useWalletIds();

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <Appbar.Action icon={MenuIcon} onPress={() => alert('Unimplemented')} />

        <Appbar.Content title="Wallets" />

        <Appbar.Action
          icon={PlusIcon}
          onPress={() => navigate('CreateAccount')}
        />
      </AppbarHeader>

      <Box m={4}>
        <FlatList
          renderItem={({ item }) => (
            <WalletCard
              id={item}
              onPress={() => {
                navigate('Accounts', {
                  onSelect: (account) => {
                    navigate('Wallet', { id: item, account });
                  },
                });
              }}
            />
          )}
          data={walletIds}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </Box>
  );
}, ListScreenSkeleton);
