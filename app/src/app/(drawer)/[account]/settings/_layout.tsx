import { Searchbar } from '#/Appbar/Searchbar';
import { Panes } from '#/layout/Panes';
import { gql } from '@api';
import { Link, Slot, Stack } from 'expo-router';
import { Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '../(home)/_layout';
import { NotFound } from '#/NotFound';
import { createStyles, useStyles } from '@theme/styles';
import { EditOutlineIcon, NavigateNextIcon, SearchIcon } from '@theme/icons';
import { ScrollView, View } from 'react-native';
import { AccountApproverItem } from '#/account/AccountApproverItem';
import { ListItem } from '#/list/ListItem';
import { AddCircleIcon } from '#/AddCircleIcon';
import { PolicyItem } from '#/policy/PolicyItem';
import { usePath } from '#/usePath';
import { FirstPane } from '#/layout/FirstPane';
import { useRouteInfo, useRouter } from 'expo-router/build/hooks';
import { ItemList } from '#/layout/ItemList';
import { AppbarMenu } from '#/Appbar/AppbarMenu';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { PolicySuggestions } from '#/account/PolicySuggestions';

export default function AccountSettingsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Panes>
        <FirstPane fixed>
          <AccountSettingsPane />
        </FirstPane>

        <Slot />
      </Panes>
    </>
  );
}

const Query = gql(/* GraphQL */ `
  query AccountSettings($account: UAddress!) {
    account(input: { account: $account }) {
      id
      name
      approvers {
        id
        address
        ...AccountApproverItem_Approver
      }
      policies {
        id
        key
        isActive
        isDraft
        threshold
        approvers {
          id
        }
        ...PolicyItem_Policy
      }
      ...PolicySuggestions_Account
    }

    user {
      id
      ...PolicySuggestions_User
    }
  }
`);

export const AccountSettingsParams = AccountParams;

function AccountSettingsPane() {
  const { styles } = useStyles(stylesheet);
  const { account } = useLocalParams(AccountSettingsParams);
  const router = useRouter();
  const path = usePath();
  const currentRouteParams = useRouteInfo().params;
  const selectAddress = useSelectAddress();

  const { account: a, user } = useQuery(Query, { account }).data;
  if (!a) return <NotFound name="Account" />;

  const policies = a.policies.sort(
    (a, b) => a.threshold - b.threshold || a.approvers.length - b.approvers.length || a.key - b.key,
  );

  return (
    <ScrollView contentContainerStyle={styles.pane}>
      <Searchbar
        leading={(props) => <AppbarMenu {...props} fallback={SearchIcon} />}
        placeholder={`Search ${a.name}`}
        trailing={() => (
          <EditOutlineIcon
            onPress={() =>
              router.push({
                pathname: '/(drawer)/[account]/settings/details',
                params: { account },
              })
            }
          />
        )}
      />

      <PolicySuggestions account={a} user={user} />

      <Text variant="labelLarge" style={styles.subheader}>
        Approvers
      </Text>
      <ItemList>
        {a.approvers.map((a) => (
          <AccountApproverItem
            key={a.id}
            account={account}
            approver={a}
            containerStyle={styles.item}
          />
        ))}

        <ListItem
          leading={AddCircleIcon}
          headline="Add approver"
          lines={2}
          containerStyle={styles.item}
          onPress={async () => {
            const approver = await selectAddress({
              include: ['approvers', 'contacts'],
              disabled: [...a.approvers.map((a) => a.address)],
            });
            if (approver) {
              router.push({
                pathname: '/(drawer)/[account]/settings/approver/[address]',
                params: { account, address: approver },
              });
            }
          }}
        />
      </ItemList>

      <Text variant="labelLarge" style={styles.subheader}>
        Policies
      </Text>
      <ItemList>
        {policies.map((p) => (
          <Link
            key={p.id}
            href={{
              pathname: `/(drawer)/[account]/settings/policy/[id]/`,
              params: { account, id: p.id },
            }}
            asChild
          >
            <PolicyItem
              policy={p}
              trailing={({ Text, ...props }) => (
                <View style={styles.trailingContainer}>
                  <Text>
                    {[p.isActive && 'Active', p.isDraft && 'Draft'].filter(Boolean).join(' | ') ||
                      'Historic'}
                  </Text>
                  <NavigateNextIcon {...props} />
                </View>
              )}
              containerStyle={styles.item}
              selected={
                path.includes('/(drawer)/[account]/settings/policy/[id]') &&
                currentRouteParams.id === p.id
              }
            />
          </Link>
        ))}

        <Link
          href={{
            pathname: `/(drawer)/[account]/settings/policy/[id]/`,
            params: { account, id: 'add' },
          }}
          asChild
        >
          <ListItem
            leading={AddCircleIcon}
            headline="Add policy"
            lines={2}
            containerStyle={styles.item}
            selected={
              path.includes('/(drawer)/[account]/settings/policy/[id]') &&
              currentRouteParams.id === 'add'
            }
          />
        </Link>
      </ItemList>
    </ScrollView>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  pane: {
    gap: 8,
  },
  item: {
    backgroundColor: colors.surface,
  },
  subheader: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}));
