import { AccountId, useAccount } from '@api/account';
import { EditIcon } from '@theme/icons';
import { Menu } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';

export interface AccountScreen2Params {
  account: AccountId;
}

export type AccountScreen2Props = StackNavigatorScreenProps<'Account'>;

export const AccountScreen2 = withSuspense(
  ({ route, navigation: { navigate } }: AccountScreen2Props) => {
    const account = useAccount(route.params.account);

    return (
      <Screen withoutTopInset>
        <Appbar
          mode="large"
          leading="back"
          headline={account.name}
          trailing={(props) => (
            <AppbarMore2 iconProps={props}>
              {({ close }) => (
                <Menu.Item
                  leadingIcon={EditIcon}
                  title="Rename"
                  onPress={() => {
                    close();
                    navigate('RenameAccountModal', { account: account.id });
                  }}
                />
              )}
            </AppbarMore2>
          )}
        />
      </Screen>
    );
  },
  ScreenSkeleton,
);
