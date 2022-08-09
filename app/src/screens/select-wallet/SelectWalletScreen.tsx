import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { useSelectWallet } from '~/components2/wallet/useSelectedWallet';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useWallets } from '~/queries/wallets/useWallets';

export type SelectWalletScreenProps = RootNavigatorScreenProps<'SelectWallet'>;

export const SelectWalletScreen = ({ navigation }: SelectWalletScreenProps) => {
  const { wallets } = useWallets();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const setSelected = useSelectWallet();

  return (
    <Box>
      <AppbarHeader>
        <AppbarBack />
        <Appbar.Content title="Select Wallet" />
      </AppbarHeader>

      <Box m={3}>
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WalletCard
              wallet={item}
              onPress={() => {
                setSelected(item);
                navigation.goBack();
              }}
            />
          )}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </Box>
  );
};
