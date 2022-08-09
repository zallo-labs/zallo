import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useNavigation } from '@react-navigation/native';
import { MenuIcon, PlusIcon } from '@util/theme/icons';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { useWallets } from '~/queries/wallets/useWallets';

export const WalletsScreen = withSkeleton(() => {
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const { wallets } = useWallets();

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <Appbar.Action icon={MenuIcon} onPress={() => alert('Unimplemented')} />

        <Appbar.Content title="Wallets" />

        <Appbar.Action
          icon={PlusIcon}
          onPress={() => navigate('CreateFirstWallet')}
        />
      </AppbarHeader>

      <Box m={3}>
        <FlatList
          data={wallets}
          keyExtractor={(wallet) => wallet.id}
          renderItem={({ item: wallet }) => (
            <WalletCard
              wallet={wallet}
              onPress={() => navigate('Wallet', { id: wallet })}
            />
          )}
          onScroll={handleScroll}
        />
      </Box>
    </Box>
  );
}, ListScreenSkeleton);
