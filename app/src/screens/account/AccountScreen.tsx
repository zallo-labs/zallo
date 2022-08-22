import { Box } from '@components/Box';
import { TextField } from '@components/fields/TextField';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccount } from '~/queries/account/useAccount';
import { WalletId } from '~/queries/wallets';
import { AccountAppbar } from './AccountAppbar';
import { DeployAccountFAB } from './DeployAccountFAB';

export interface AccountScreenParams {
  id: Address;
  onSelectWallet?: (wallet: WalletId) => void;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = withSkeleton(
  ({ route, navigation: { navigate } }: AccountScreenProps) => {
    const { id, onSelectWallet } = route.params;
    const { account } = useAccount(id);
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const setAccountName = useSetAccountName();

    if (!account) return <Suspend />;

    return (
      <Box flex={1}>
        <AccountAppbar AppbarHeader={AppbarHeader} account={account.addr} />

        <FlatList
          ListHeaderComponent={
            <Box mb={3}>
              <TextField
                label="Name"
                defaultValue={account.name}
                onSubmitEditing={(event) =>
                  setAccountName({
                    ...account,
                    name: event.nativeEvent.text,
                  })
                }
                autoCorrect={false}
              />
            </Box>
          }
          renderItem={({ item }) => (
            <WalletCard
              id={item}
              showAccount={false}
              onPress={() => {
                if (onSelectWallet) {
                  onSelectWallet(item);
                } else {
                  navigate('Wallet', {
                    account: account.addr,
                    id: item,
                  });
                }
              }}
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              style={styles.create}
              icon={PlusIcon}
              onPress={() => navigate('Wallet', { account: account.addr })}
            >
              Wallet
            </Button>
          }
          style={styles.list}
          data={account.walletIds}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        <DeployAccountFAB account={account} />
      </Box>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(3),
  },
  create: {
    flex: 1,
    alignSelf: 'flex-end',
    marginTop: space(2),
  },
}));
