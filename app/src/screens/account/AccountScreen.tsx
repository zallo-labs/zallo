import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address, UserId } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AccountAppbar } from './AccountAppbar';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { FAB } from '~/components/FAB';
import { useAccount } from '~/queries/account/useAccount.api';
import { UserItem } from './UserItemCard';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { TextField } from '~/components/fields/TextField';
import { TextInput } from 'react-native-paper';
import { SearchIcon } from '@theme/icons';

export interface AccountScreenParams {
  id: Address;
  onSelectUser?: (user: UserId) => void;
  inactiveOpacity?: boolean;
  title?: string;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = withSkeleton(
  ({
    navigation: { navigate },
    route: {
      params: { id, onSelectUser, inactiveOpacity, title },
    },
  }: AccountScreenProps) => {
    const styles = useStyles();
    const [account] = useAccount(id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();

    const [users, searchProps] = useFuzzySearch(account.users, [
      'name',
      'addr',
    ]);

    return (
      <Box flex={1}>
        <AccountAppbar
          AppbarHeader={AppbarHeader}
          title={title}
          account={account}
        />

        <FlatList
          ListHeaderComponent={
            <TextField
              left={<TextInput.Icon icon={SearchIcon} />}
              label="Search users"
              {...searchProps}
            />
          }
          renderItem={({ item: user }) => (
            <UserItem
              user={user}
              onPress={() => {
                if (onSelectUser) {
                  onSelectUser(user);
                } else {
                  navigate('User', { user });
                }
              }}
            />
          )}
          data={users}
          ListHeaderComponentStyle={styles.header}
          extraData={[onSelectUser, navigate]}
          stickyHeaderIndices={[0]}
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
  header: {
    marginHorizontal: space(2),
    marginBottom: space(1),
  },
}));
