import { Box } from '~/components/layout/Box';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { PlusIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address } from 'lib';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccountIds } from '~/queries/account/useAccountIds';
import { AccountCard } from '../account/AccountCard';

export interface AccountsScreenParams {
  onSelect?: (account: Address) => void;
}

export type AccountsScreenProps = RootNavigatorScreenProps<'Accounts'>;

export const AccountsScreen = withSkeleton(
  ({ navigation: { navigate }, route }: AccountsScreenProps) => {
    const { onSelect } = route.params;
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const accounts = useAccountIds();

    const select = useCallback(
      (account: Address) => {
        if (onSelect) {
          onSelect(account);
        } else {
          navigate('Account', { id: account });
        }
      },
      [navigate, onSelect],
    );

    return (
      <Box>
        <AppbarHeader mode="medium">
          <Appbar.BackAction onPress={useGoBack()} />
          <Appbar.Content title={onSelect ? 'Select Account' : 'Accounts'} />
        </AppbarHeader>

        <FlatList
          renderItem={({ item }) => (
            <AccountCard id={item} onPress={() => select(item)} />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              mode="text"
              style={styles.create}
              onPress={() =>
                navigate('CreateAccount', {
                  navigate: (accountId) => select(accountId),
                })
              }
            >
              Account
            </Button>
          }
          style={styles.list}
          data={accounts}
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
