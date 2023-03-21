import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { makeStyles } from '~/util/theme/makeStyles';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { AccountId, useAccount } from '@api/account';
import { Appbar } from 'react-native-paper';
import { NameIcon, QuorumsIcon, ShareIcon } from '@theme/icons';
import { buildAddrLink } from '~/util/addrLink';
import { Share } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { useGoBack } from '~/components/Appbar/useGoBack';

export interface AccountScreenParams {
  account: AccountId;
}

export type AccountScreenProps = StackNavigatorScreenProps<'Account'>;

export const AccountScreen = withSuspense(
  ({ navigation: { navigate }, route: { params } }: AccountScreenProps) => {
    const styles = useStyles();
    const account = useAccount(params.account);

    return (
      <Box flex={1}>
        <Appbar.Header mode="large">
          <Appbar.BackAction onPress={useGoBack()} />
          <Appbar.Content title={account.name} />

          <Appbar.Action
            icon={ShareIcon}
            onPress={() => {
              const url = buildAddrLink({ target_address: account.id });
              Share.share({ url, message: `${account.name}\n${url}` });
            }}
          />
        </Appbar.Header>

        <Box style={styles.list}>
          <ListItem
            leading={NameIcon}
            headline="Rename"
            supporting="Change the name of the account"
            onPress={() => navigate('RenameAccount', { account: account.id })}
          />
        </Box>
      </Box>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ space }) => ({
  list: {
    paddingVertical: 8,
  },
}));
