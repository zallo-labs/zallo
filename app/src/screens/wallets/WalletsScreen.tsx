import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useNavigation } from '@react-navigation/native';
import { PlusIcon } from '@util/theme/icons';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { useCreateWallet } from '~/mutations/wallet/useCreateWallet';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { useWalletIds } from '~/queries/wallets/useWalletIds';

export const WalletsScreen = withSkeleton(() => {
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const createWallet = useCreateWallet();
  const { walletIds } = useWalletIds();

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <AppbarBack />

        <Appbar.Content title="Wallets" />

        <Appbar.Action icon={PlusIcon} onPress={createWallet} />
      </AppbarHeader>

      <Box m={3}>
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
