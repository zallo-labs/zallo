import { Box } from '@components/Box';
import { SubmittableTextField } from '@components/fields/SubmittableTextField';
import { Suspend } from '@components/Suspender';
import { DeleteIcon, PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { Appbar, Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { useDeleteAccount } from '~/mutations/account/useDeleteAccount';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccount } from '~/queries/account/useAccount';

export interface AccountScreenParams {
  id: Address;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = ({ route, navigation }: AccountScreenProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const deleteAccount = useDeleteAccount();
  const setName = useSetAccountName();
  const existing = useAccount(route.params.id)!;
  const goBack = useGoBack();

  const account = existing!;

  return (
    <Box>
      <AppbarHeader mode="medium">
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="Account" />

        {existing && (
          <Appbar.Action
            icon={DeleteIcon}
            onPress={() => deleteAccount(existing)}
          />
        )}
      </AppbarHeader>

      <FlatList
        ListHeaderComponent={
          <Box my={3}>
            <SubmittableTextField
              value={account.name}
              onSubmit={(name) => setName({ ...existing, name })}
            />
          </Box>
        }
        renderItem={({ item }) => (
          <WalletCard
            id={item}
            available
            onPress={() =>
              navigation.navigate('Wallet', { account: account.addr, id: item })
            }
          />
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
        ListFooterComponent={
          <Button
            style={styles.create}
            icon={PlusIcon}
            onPress={() =>
              navigation.navigate('Wallet', { account: account.addr })
            }
          >
            Create
          </Button>
        }
        style={styles.list}
        data={account.walletIds}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(4),
  },
  create: {
    alignSelf: 'flex-end',
  },
}));
