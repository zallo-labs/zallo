import { Box } from '@components/Box';
import { SubmittableTextField } from '@components/fields/SubmittableTextField';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { Appbar, Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { WalletCard } from '~/components2/wallet/WalletCard';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccount } from '~/queries/account/useAccount';

export interface AccountScreenParams {
  id: Address;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = withSkeleton(
  ({ route, navigation }: AccountScreenProps) => {
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const setName = useSetAccountName();
    const { account: existing, loading } = useAccount(route.params.id)!;
    const goBack = useGoBack();

    const account = existing!;

    if (loading) return <Suspend />;

    return (
      <Box>
        <AppbarHeader mode="medium">
          <Appbar.BackAction onPress={goBack} />
          <Appbar.Content title="Account" />
        </AppbarHeader>

        <FlatList
          ListHeaderComponent={
            <Box my={3}>
              <SubmittableTextField
                label="Name"
                value={account.name}
                onSubmit={(name) => {
                  if (existing) setName({ ...existing, name });
                }}
              />
            </Box>
          }
          renderItem={({ item }) => (
            <WalletCard
              id={item}
              available
              showAccount={false}
              onPress={() =>
                navigation.navigate('Wallet', {
                  account: account.addr,
                  id: item,
                })
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
  },
  ScreenSkeleton,
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
