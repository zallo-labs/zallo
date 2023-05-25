import { useAccount } from '@api/account';
import { FlashList } from '@shopify/flash-list';
import { EditIcon, NavigateNextIcon, PlusIcon } from '@theme/icons';
import { Address, PolicyKey } from 'lib';
import { StyleSheet, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { match } from 'ts-pattern';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { Fab } from '~/components/buttons/Fab';
import { Screen } from '~/components/layout/Screen';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem, ListItemHeight } from '~/components/list/ListItem';
import { PolicyIcon } from '~/components/policy/PolicyIcon';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface AccountScreenParams {
  account: Address;
}

export type AccountScreenProps = StackNavigatorScreenProps<'Account'>;

export const AccountScreen = withSuspense(
  ({ route, navigation: { navigate } }: AccountScreenProps) => {
    const account = useAccount(route.params.account);

    return (
      <Screen>
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
                    navigate('RenameAccountModal', { account: account.address });
                  }}
                />
              )}
            </AppbarMore2>
          )}
        />

        <View style={styles.listContainer}>
          <FlashList
            data={account.policies}
            ListHeaderComponent={<ListHeader>Access Policies</ListHeader>}
            renderItem={({ item: policy }) => (
              <ListItem
                leading={(props) => <PolicyIcon policy={policy} {...props} />}
                headline={policy.name}
                supporting={match((policy.state ?? policy.draft)!.approvers.size)
                  .with(0, () => 'No approvers')
                  .with(1, () => '1 approver')
                  .otherwise((approvers) => `${approvers} approvers`)}
                trailing={NavigateNextIcon}
                onPress={() => {
                  navigate('Policy', { account: policy.account, key: policy.key });
                }}
              />
            )}
            estimatedItemSize={ListItemHeight.DOUBLE_LINE}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <Fab
          icon={PlusIcon}
          label="Add policy"
          onPress={() => navigate('Policy', { account: account.address })}
        />
      </Screen>
    );
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 8,
  },
});
