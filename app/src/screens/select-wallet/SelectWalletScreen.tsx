import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSelectWallet } from '~/components2/wallet/useSelectedWallet';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useWalletIds } from '~/queries/wallets/useWalletIds';
import { WalletCard } from '~/components2/wallet/WalletCard';

export type SelectWalletScreenProps = RootNavigatorScreenProps<'SelectWallet'>;

export const SelectWalletScreen = ({ navigation }: SelectWalletScreenProps) => {
  const { walletIds } = useWalletIds();
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
          renderItem={({ item }) => (
            <WalletCard
              id={item}
              onPress={() => {
                setSelected(item);
                navigation.goBack();
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
};
