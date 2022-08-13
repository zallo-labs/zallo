import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { AccountCard } from '~/components2/account/AccountCard';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccountIds } from '~/queries/account/useAccountIds';

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

    return (
      <Box>
        <AppbarHeader mode="medium">
          <Appbar.BackAction onPress={useGoBack()} />
          <Appbar.Content title={onSelect ? 'Select Account' : 'Accounts'} />
        </AppbarHeader>

        <FlatList
          renderItem={({ item }) => (
            <AccountCard
              id={item}
              onPress={() => {
                if (onSelect) {
                  onSelect(item);
                } else {
                  navigate('Account', { id: item });
                }
              }}
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              mode="text"
              style={styles.create}
              onPress={() =>
                navigate('CreateAccount', {
                  navigate: (navigate, accountId) =>
                    navigate('Account', { id: accountId }),
                })
              }
            >
              Create
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
  },
}));
