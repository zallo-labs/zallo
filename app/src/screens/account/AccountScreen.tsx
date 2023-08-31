import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { EditIcon, NavigateNextIcon, PlusIcon } from '@theme/icons';
import { Address } from 'lib';
import { StyleSheet, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { NotFound } from '~/components/NotFound';
import { Fab } from '~/components/buttons/Fab';
import { Screen } from '~/components/layout/Screen';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItemHeight } from '~/components/list/ListItem';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { PolicyItem } from './PolicyItem';

const Query = gql(/* GraphQL */ `
  query AccountScreen($account: Address!) {
    account(input: { address: $account }) {
      id
      address
      name
      policies {
        id
        key
        ...PolicyItem_Policy
      }
    }
  }
`);

export interface AccountScreenParams {
  account: Address;
}

export type AccountScreenProps = StackNavigatorScreenProps<'Account'>;

export const AccountScreen = withSuspense(
  ({ route, navigation: { navigate } }: AccountScreenProps) => {
    const { account } = useQuery(Query, { account: route.params.account }).data;

    if (!account) return <NotFound name="Account" />;

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
              <PolicyItem
                policy={policy}
                trailing={NavigateNextIcon}
                onPress={() => {
                  navigate('Policy', { account: account.address, key: policy.key });
                }}
              />
            )}
            estimatedItemSize={ListItemHeight.DOUBLE_LINE}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <Fab
          icon={PlusIcon}
          label="Add policy"
          onPress={() => navigate('AddPolicy', { account: account.address })}
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
