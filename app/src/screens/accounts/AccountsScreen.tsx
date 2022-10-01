import { Box } from '~/components/layout/Box';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { PlusIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { UserId } from 'lib';
import { FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import AccountCard from './AccountCard';
import { useUserIds } from '~/queries/user/useUserIds.api';

export interface AccountsScreenParams {
  onSelect?: (user: UserId) => void;
}

export type AccountsScreenProps = RootNavigatorScreenProps<'Accounts'>;

export const AccountsScreen = withSkeleton(
  ({ navigation: { navigate }, route }: AccountsScreenProps) => {
    const { onSelect } = route.params;
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const [users] = useUserIds();

    return (
      <Box>
        <AppbarHeader mode="large">
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
                  navigate('User', { user: item });
                }
              }}
            />
          )}
          ItemSeparatorComponent={() => <Box mt={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              mode="text"
              style={styles.create}
              onPress={() =>
                navigate('CreateAccount', {
                  onCreate: ({ account }) =>
                    navigate('Account', { id: account }),
                })
              }
            >
              Account
            </Button>
          }
          data={users}
          style={styles.list}
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
    marginHorizontal: space(2),
  },
  create: {
    alignSelf: 'flex-end',
    marginTop: space(1),
  },
}));
