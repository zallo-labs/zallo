import { Box } from '~/components/layout/Box';
import { TextField } from '~/components/fields/TextField';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Suspend } from '~/components/Suspender';
import { PlusIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { Button, Text } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { WalletCard } from '~/components/wallet/WalletCard';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccount } from '~/queries/account/useAccount';
import { WalletId } from '~/queries/wallets';
import { AccountAppbar } from './AccountAppbar';
import { useState } from 'react';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { FAB } from '~/components/FAB';

export interface AccountScreenParams {
  id: Address;
  onSelectWallet?: (wallet: WalletId) => void;
  inactiveOpacity?: boolean;
  title?: string;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = withSkeleton(
  ({
    navigation: { navigate },
    route: {
      params: { id, onSelectWallet, inactiveOpacity, title },
    },
  }: AccountScreenProps) => {
    const { account } = useAccount(id);
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const setAccountName = useSetAccountName(account);

    const [nameInput, setNameInput] = useState(account?.name ?? '');

    if (!account) return <Suspend />;

    return (
      <Box flex={1}>
        <AccountAppbar
          AppbarHeader={AppbarHeader}
          title={title}
          account={account.addr}
        />

        <FlatList
          ListHeaderComponent={
            <>
              <TextField
                label="Name"
                value={nameInput}
                onChangeText={setNameInput}
                onSubmitEditing={() => setAccountName(nameInput)}
                onBlur={() => setAccountName(nameInput)}
              />

              <Box my={3}>
                <Text variant="titleSmall">Wallets</Text>
              </Box>
            </>
          }
          renderItem={({ item }) => (
            <WalletCard
              id={item}
              showAccount={false}
              inactiveOpacity={inactiveOpacity}
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
          extraData={[inactiveOpacity, onSelectWallet, navigate]}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        <ActivateAccountButton account={account}>{FAB}</ActivateAccountButton>
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
