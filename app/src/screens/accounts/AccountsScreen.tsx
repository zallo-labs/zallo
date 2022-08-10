import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { AccountCard } from '~/components2/account/AccountCard';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccounts } from '~/queries/account/useAccounts';

export type AccountsScreenProps = RootNavigatorScreenProps<'Accounts'>;

export const AccountsScreen = withSkeleton(
  ({ navigation: { navigate } }: AccountsScreenProps) => {
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const { accounts } = useAccounts();

    return (
      <Box>
        <AppbarHeader mode="medium">
          <Appbar.BackAction onPress={useGoBack()} />
          <Appbar.Content title="Accounts" />
        </AppbarHeader>

        <FlatList
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              onPress={() => navigate('Account', { id: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              mode="text"
              style={styles.create}
              onPress={() => navigate('Account', {})}
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
    marginHorizontal: space(4),
  },
  create: {
    alignSelf: 'flex-end',
  },
}));
