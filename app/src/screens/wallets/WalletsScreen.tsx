import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { PlusIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { WalletCard } from '~/components/wallet/WalletCard';
import { useCreateWallet } from '~/mutations/wallet/useCreateWallet';
import { useWalletIds } from '~/queries/wallets/useWalletIds';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';

export type WalletsScreenProps = RootNavigatorScreenProps<'Wallets'>;

export const WalletsScreen = withSkeleton(
  ({ navigation: { navigate } }: WalletsScreenProps) => {
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const createWallet = useCreateWallet();
    const { walletIds } = useWalletIds();

    return (
      <Box flex={1}>
        <AppbarHeader mode="center-aligned">
          <AppbarBack />
          <Appbar.Content title="Wallets" />
        </AppbarHeader>

        <FlatList
          renderItem={({ item }) => (
            <WalletCard
              id={item}
              onPress={() =>
                navigate('Wallet', { id: item, account: item.accountAddr })
              }
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              mode="text"
              style={styles.create}
              onPress={createWallet}
            >
              Account
            </Button>
          }
          style={styles.list}
          data={walletIds}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    );
  },
  ListScreenSkeleton,
);

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(3),
  },
  create: {
    alignSelf: 'flex-end',
    marginTop: space(2),
  },
}));
